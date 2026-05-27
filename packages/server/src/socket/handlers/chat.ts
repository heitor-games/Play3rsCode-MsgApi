import { Socket, Server } from 'socket.io';
import { EVENTS } from '../events';
import { createMessage, markAsRead, getChannelMessages, getDirectMessages } from '../../services/message';
import { isChannelMember } from '../../services/channel';
import { checkUsageLimit, incrementUsage } from '../../billing/usage';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export function registerChatHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;

  // Send a message (DM or channel)
  socket.on(EVENTS.MESSAGE_SEND, async (payload) => {
    try {
      const { content, channelId, recipientId } = payload;

      if (!content?.trim()) {
        socket.emit(EVENTS.ERROR, { code: 'INVALID_INPUT', message: 'Content is required' });
        return;
      }

      if (!channelId && !recipientId) {
        socket.emit(EVENTS.ERROR, { code: 'INVALID_INPUT', message: 'channelId or recipientId required' });
        return;
      }

      // Check usage limit for messages
      const subscription = await prisma.subscription.findUnique({ where: { userId } });
      const planTier = subscription?.plan || 'FREE';
      const { allowed, current, limit } = await checkUsageLimit(userId, 'MESSAGES', planTier);

      if (!allowed) {
        socket.emit(EVENTS.ERROR, {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: `Message limit exceeded (${current}/${limit}). Upgrade your plan.`,
        });
        return;
      }

      // If channel message, verify membership
      if (channelId) {
        const isMember = await isChannelMember(channelId, userId);
        if (!isMember) {
          socket.emit(EVENTS.ERROR, { code: 'FORBIDDEN', message: 'Not a channel member' });
          return;
        }
      }

      const message = await createMessage({
        content: content.trim(),
        senderId: userId,
        channelId,
        recipientId,
      });

      const payload_out = {
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          channelId: message.channelId,
          recipientId: message.recipientId,
          type: message.type,
          createdAt: message.createdAt.toISOString(),
        },
        sender: message.sender,
      };

      // Increment usage counter
      await incrementUsage(userId, 'MESSAGES');

      // Acknowledge to sender
      socket.emit(EVENTS.MESSAGE_ACK, { messageId: message.id, status: 'sent' });

      if (channelId) {
        // Broadcast to channel room (excluding sender)
        socket.to(`channel:${channelId}`).emit(EVENTS.MESSAGE_NEW, payload_out);
      } else if (recipientId) {
        // Send to recipient's personal room
        socket.to(`user:${recipientId}`).emit(EVENTS.MESSAGE_NEW, payload_out);
      }

      logger.info({ messageId: message.id, senderId: userId, channelId, recipientId }, 'Message sent');
    } catch (err) {
      logger.error({ err, userId }, 'Error sending message');
      socket.emit(EVENTS.ERROR, { code: 'INTERNAL', message: 'Failed to send message' });
    }
  });

  // Mark message as read
  socket.on(EVENTS.MESSAGE_READ, async (payload) => {
    try {
      const { messageId } = payload;
      const updated = await markAsRead(messageId, userId);
      if (updated && updated.senderId) {
        socket.to(`user:${updated.senderId}`).emit(EVENTS.MESSAGE_NEW, {
          message: {
            id: updated.id,
            content: updated.content,
            senderId: updated.senderId,
            channelId: updated.channelId,
            recipientId: updated.recipientId,
            type: 'READ_RECEIPT',
            createdAt: updated.readAt!.toISOString(),
          },
          sender: { id: userId, username: socket.data.username, avatarUrl: null },
        });
      }
    } catch (err) {
      logger.error({ err, userId }, 'Error marking message as read');
    }
  });
}
