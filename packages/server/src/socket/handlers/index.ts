import { Socket, Server } from 'socket.io';
import { registerChatHandlers } from './chat';
import { registerChannelHandlers } from './channel';
import { registerPresenceHandlers } from './presence';
import { setUserOnline, setUserOffline } from '../../services/user';
import { getUserChannels } from '../../services/channel';
import { checkUsageLimit, incrementUsage } from '../../billing/usage';
import { prisma } from '../../config/database';
import { getRedis } from '../../config/redis';
import { EVENTS } from '../events';
import { logger } from '../../utils/logger';

export function registerAllHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;
  const username = socket.data.username as string;

  // Register sub-handlers
  registerChatHandlers(io, socket);
  registerChannelHandlers(io, socket);
  registerPresenceHandlers(io, socket);

  // On connect: join personal room + channel rooms
  socket.join(`user:${userId}`);

  (async () => {
    try {
      // Check connection limit
      const redis = getRedis();
      const subscription = await prisma.subscription.findUnique({ where: { userId } });
      const planTier = subscription?.plan || 'FREE';
      const connectionCount = await redis.scard(`connections:${userId}`);
      const { allowed, limit } = await checkUsageLimit(userId, 'CONNECTIONS', planTier);

      if (!allowed && connectionCount >= limit) {
        socket.emit(EVENTS.ERROR, {
          code: 'USAGE_LIMIT_EXCEEDED',
          message: `Connection limit exceeded (${connectionCount}/${limit}). Upgrade your plan.`,
        });
        socket.disconnect(true);
        return;
      }

      // Track connection in Redis
      await redis.sadd(`connections:${userId}`, socket.id);
      await incrementUsage(userId, 'CONNECTIONS');

      // Set user online
      await setUserOnline(userId);

      // Join all channel rooms the user is a member of
      const channels = await getUserChannels(userId);
      for (const channel of channels) {
        socket.join(`channel:${channel.id}`);
      }

      // Broadcast online status
      socket.broadcast.emit(EVENTS.USER_ONLINE, { userId });
      logger.info({ userId, username }, 'User connected');
    } catch (err) {
      logger.error({ err, userId }, 'Error during connection setup');
    }
  })();

  // On disconnect
  socket.on('disconnect', async (reason) => {
    try {
      const redis = getRedis();
      await redis.srem(`connections:${userId}`, socket.id);

      // Only set offline if no more connections
      const remaining = await redis.scard(`connections:${userId}`);
      if (remaining === 0) {
        await setUserOffline(userId);
        socket.broadcast.emit(EVENTS.USER_OFFLINE, { userId });
      }

      logger.info({ userId, username, reason }, 'User disconnected');
    } catch (err) {
      logger.error({ err, userId }, 'Error during disconnect');
    }
  });
}
