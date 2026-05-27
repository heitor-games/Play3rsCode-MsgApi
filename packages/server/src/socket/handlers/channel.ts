import { Socket, Server } from 'socket.io';
import { EVENTS } from '../events';
import { createChannel, joinChannel, leaveChannel, getChannel, getPublicChannels, getUserChannels } from '../../services/channel';
import { checkUsageLimit, incrementUsage } from '../../billing/usage';
import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

export function registerChannelHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;

  // Create a channel
  socket.on(EVENTS.CHANNEL_CREATE, async (payload) => {
    try {
      const { name, description, isPublic } = payload;

      if (!name?.trim()) {
        socket.emit(EVENTS.ERROR, { code: 'INVALID_INPUT', message: 'Channel name is required' });
        return;
      }

      // Check usage limit for channels
      const subscription = await prisma.subscription.findUnique({ where: { userId } });
      const planTier = subscription?.plan || 'FREE';
      const { allowed, current, limit } = await checkUsageLimit(userId, 'CHANNELS', planTier);

      if (!allowed) {
        socket.emit(EVENTS.ERROR, {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: `Channel limit exceeded (${current}/${limit}). Upgrade your plan.`,
        });
        return;
      }

      const channel = await createChannel(name.trim(), userId, description, isPublic ?? true);

      // Join the socket room
      socket.join(`channel:${channel.id}`);

      // Increment usage counter
      await incrementUsage(userId, 'CHANNELS');

      socket.emit(EVENTS.CHANNEL_CREATED, { channel });
      logger.info({ channelId: channel.id, name, createdBy: userId }, 'Channel created');
    } catch (err: any) {
      if (err.code === 'P2002') {
        socket.emit(EVENTS.ERROR, { code: 'CONFLICT', message: 'Channel name already exists' });
      } else {
        logger.error({ err, userId }, 'Error creating channel');
        socket.emit(EVENTS.ERROR, { code: 'INTERNAL', message: 'Failed to create channel' });
      }
    }
  });

  // Join a channel
  socket.on(EVENTS.CHANNEL_JOIN, async (payload) => {
    try {
      const { channelId } = payload;

      const channel = await getChannel(channelId);
      if (!channel) {
        socket.emit(EVENTS.ERROR, { code: 'NOT_FOUND', message: 'Channel not found' });
        return;
      }

      if (!channel.isPublic) {
        socket.emit(EVENTS.ERROR, { code: 'FORBIDDEN', message: 'Cannot join private channel' });
        return;
      }

      const member = await joinChannel(channelId, userId);
      socket.join(`channel:${channelId}`);

      // Notify channel members
      io.to(`channel:${channelId}`).emit(EVENTS.CHANNEL_MEMBER_JOINED, {
        channelId,
        user: { id: userId, username: socket.data.username },
      });

      logger.info({ channelId, userId }, 'User joined channel');
    } catch (err) {
      logger.error({ err, userId }, 'Error joining channel');
      socket.emit(EVENTS.ERROR, { code: 'INTERNAL', message: 'Failed to join channel' });
    }
  });

  // Leave a channel
  socket.on(EVENTS.CHANNEL_LEAVE, async (payload) => {
    try {
      const { channelId } = payload;

      await leaveChannel(channelId, userId);
      socket.leave(`channel:${channelId}`);

      // Notify channel members
      io.to(`channel:${channelId}`).emit(EVENTS.CHANNEL_MEMBER_LEFT, {
        channelId,
        userId,
      });

      logger.info({ channelId, userId }, 'User left channel');
    } catch (err) {
      logger.error({ err, userId }, 'Error leaving channel');
      socket.emit(EVENTS.ERROR, { code: 'INTERNAL', message: 'Failed to leave channel' });
    }
  });
}
