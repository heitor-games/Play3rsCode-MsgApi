import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export async function createChannel(
  name: string,
  ownerId: string,
  description?: string,
  isPublic = true
) {
  const channel = await prisma.channel.create({
    data: {
      name,
      description,
      isPublic,
      ownerId,
      members: {
        create: { userId: ownerId, role: 'OWNER' },
      },
    },
    include: {
      members: true,
      _count: { select: { members: true } },
    },
  });

  logger.debug({ channelId: channel.id, name }, 'Channel created');
  return channel;
}

export async function joinChannel(channelId: string, userId: string) {
  const existing = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId } },
  });

  if (existing) return existing;

  const member = await prisma.channelMember.create({
    data: { channelId, userId, role: 'MEMBER' },
    include: { user: { select: { id: true, username: true } } },
  });

  logger.debug({ channelId, userId }, 'User joined channel');
  return member;
}

export async function leaveChannel(channelId: string, userId: string) {
  await prisma.channelMember.deleteMany({
    where: { channelId, userId },
  });

  logger.debug({ channelId, userId }, 'User left channel');
}

export async function getChannel(channelId: string) {
  return prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, avatarUrl: true } } },
      },
      _count: { select: { members: true } },
    },
  });
}

export async function getPublicChannels() {
  return prisma.channel.findMany({
    where: { isPublic: true },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getUserChannels(userId: string) {
  return prisma.channel.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function isChannelMember(channelId: string, userId: string): Promise<boolean> {
  const member = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId } },
  });
  return !!member;
}

export async function getChannelMembers(channelId: string) {
  return prisma.channelMember.findMany({
    where: { channelId },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true, isOnline: true } },
    },
  });
}
