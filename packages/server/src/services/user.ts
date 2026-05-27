import { prisma } from '../config/database';
import { getRedis } from '../config/redis';
import { logger } from '../utils/logger';

const PRESENCE_TTL = 300; // 5 minutes

export async function setUserOnline(userId: string): Promise<void> {
  const redis = getRedis();

  await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    }),
    redis.set(`user:online:${userId}`, '1', 'EX', PRESENCE_TTL),
  ]);

  logger.debug({ userId }, 'User set online');
}

export async function setUserOffline(userId: string): Promise<void> {
  const redis = getRedis();

  await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: { isOnline: false, lastSeen: new Date() },
    }),
    redis.del(`user:online:${userId}`),
  ]);

  logger.debug({ userId }, 'User set offline');
}

export async function isUserOnline(userId: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.get(`user:online:${userId}`);
  return result === '1';
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatarUrl: true,
      isOnline: true,
      lastSeen: true,
    },
  });
}
