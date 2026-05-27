import { NotificationProvider } from './provider';
import { NotificationPayload } from '@chat/shared';
import { checkUsageLimit, incrementUsage } from '../billing/usage';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export class NotificationManager {
  private providers: NotificationProvider[] = [];

  register(provider: NotificationProvider) {
    this.providers.push(provider);
    logger.info({ provider: provider.name }, 'Notification provider registered');
  }

  async notify(userId: string, payload: NotificationPayload): Promise<boolean> {
    // Check usage limit for notifications
    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    const planTier = subscription?.plan || 'FREE';
    const { allowed, current, limit } = await checkUsageLimit(userId, 'NOTIFICATIONS', planTier);

    if (!allowed) {
      logger.warn({ userId, current, limit }, 'Notification limit exceeded');
      return false;
    }

    for (const provider of this.providers) {
      try {
        await provider.send(userId, payload);
      } catch (err) {
        logger.error({ err, provider: provider.name, userId }, 'Notification delivery failed');
      }
    }

    // Increment usage counter
    await incrementUsage(userId, 'NOTIFICATIONS');
    return true;
  }

  async notifyAll(userIds: string[], payload: NotificationPayload): Promise<void> {
    await Promise.all(userIds.map((id) => this.notify(id, payload)));
  }
}
