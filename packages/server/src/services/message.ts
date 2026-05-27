import { prisma } from '../config/database';
import { logger } from '../utils/logger';

type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM';

interface CreateMessageInput {
  content: string;
  senderId: string;
  channelId?: string;
  recipientId?: string;
  type?: MessageType;
}

export async function createMessage(input: CreateMessageInput) {
  const message = await prisma.message.create({
    data: {
      content: input.content,
      senderId: input.senderId,
      channelId: input.channelId || null,
      recipientId: input.recipientId || null,
      type: input.type || 'TEXT',
    },
    include: {
      sender: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });

  logger.debug({ messageId: message.id, senderId: input.senderId }, 'Message created');
  return message;
}

export async function markAsRead(messageId: string, userId: string) {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      recipientId: userId,
      readAt: null,
    },
  });

  if (!message) return null;

  return prisma.message.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  });
}

export async function getChannelMessages(
  channelId: string,
  limit = 50,
  before?: string
) {
  return prisma.message.findMany({
    where: {
      channelId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sender: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}

export async function getDirectMessages(
  userId: string,
  otherUserId: string,
  limit = 50,
  before?: string
) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      sender: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });
}
