import { Socket, Server } from 'socket.io';
import { EVENTS } from '../events';
import { getRedis } from '../../config/redis';
import { logger } from '../../utils/logger';

export function registerPresenceHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId as string;
  const redis = getRedis();

  // Typing indicators
  socket.on(EVENTS.TYPING_START, (payload) => {
    const { channelId, recipientId } = payload;

    if (channelId) {
      socket.to(`channel:${channelId}`).emit(EVENTS.TYPING_INDICATOR, {
        userId,
        channelId,
        isTyping: true,
      });
    } else if (recipientId) {
      socket.to(`user:${recipientId}`).emit(EVENTS.TYPING_INDICATOR, {
        userId,
        isTyping: true,
      });
    }
  });

  socket.on(EVENTS.TYPING_STOP, (payload) => {
    const { channelId, recipientId } = payload;

    if (channelId) {
      socket.to(`channel:${channelId}`).emit(EVENTS.TYPING_INDICATOR, {
        userId,
        channelId,
        isTyping: false,
      });
    } else if (recipientId) {
      socket.to(`user:${recipientId}`).emit(EVENTS.TYPING_INDICATOR, {
        userId,
        isTyping: false,
      });
    }
  });
}
