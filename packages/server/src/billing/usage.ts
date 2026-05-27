import { getRedis } from '../config/redis';
import { prisma } from '../config/database';
import { getPlanLimits } from './plans';
import { logger } from '../utils/logger';

export type MetricType = 'MESSAGES' | 'CHANNELS' | 'CONNECTIONS' | 'NOTIFICATIONS';

function getRedisKey(userId: string, metric: MetricType, periodStart: string): string {
  return `usage:${userId}:${metric}:${periodStart}`;
}

function getPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getPeriodEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

export async function incrementUsage(userId: string, metric: MetricType, quantity = 1): Promise<number> {
  const redis = getRedis();
  const periodStart = getPeriodStart();
  const key = getRedisKey(userId, metric, periodStart.toISOString());

  const newCount = await redis.incrby(key, quantity);

  // Set TTL to end of month + 1 day buffer
  const periodEnd = getPeriodEnd();
  const ttlSeconds = Math.ceil((periodEnd.getTime() - Date.now()) / 1000) + 86400;
  await redis.expire(key, ttlSeconds);

  return newCount;
}

export async function getCurrentUsage(userId: string, metric: MetricType): Promise<number> {
  const redis = getRedis();
  const periodStart = getPeriodStart();
  const key = getRedisKey(userId, metric, periodStart.toISOString());

  const count = await redis.get(key);
  return count ? parseInt(count, 10) : 0;
}

export async function getAllUsage(userId: string): Promise<Record<MetricType, number>> {
  const [messages, channels, connections, notifications] = await Promise.all([
    getCurrentUsage(userId, 'MESSAGES'),
    getCurrentUsage(userId, 'CHANNELS'),
    getCurrentUsage(userId, 'CONNECTIONS'),
    getCurrentUsage(userId, 'NOTIFICATIONS'),
  ]);

  return { MESSAGES: messages, CHANNELS: channels, CONNECTIONS: connections, NOTIFICATIONS: notifications };
}

export async function checkUsageLimit(
  userId: string,
  metric: MetricType,
  planTier: string
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const limits = getPlanLimits(planTier);
  const limit = limits[metric.toLowerCase() as keyof typeof limits];
  const current = await getCurrentUsage(userId, metric);

  if (limit === Infinity) {
    return { allowed: true, current, limit: -1 }; // -1 means unlimited
  }

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function syncUsageToDb(userId: string): Promise<void> {
  try {
    const periodStart = getPeriodStart();
    const periodEnd = getPeriodEnd();
    const usage = await getAllUsage(userId);

    for (const [metric, quantity] of Object.entries(usage)) {
      await prisma.usageRecord.upsert({
        where: {
          userId_metric_periodStart: {
            userId,
            metric: metric as any,
            periodStart,
          },
        },
        update: { quantity },
        create: {
          userId,
          metric: metric as any,
          quantity,
          periodStart,
          periodEnd,
        },
      });
    }
  } catch (err) {
    logger.error({ err, userId }, 'Failed to sync usage to DB');
  }
}
