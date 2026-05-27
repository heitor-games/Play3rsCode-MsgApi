import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { verifyToken, JwtPayload } from './jwt';
import { logger } from '../utils/logger';

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    socket.data.userId = payload.userId;
    socket.data.username = payload.username;
    socket.data.email = payload.email;
    next();
  } catch (err) {
    logger.warn({ err }, 'Socket authentication failed');
    next(new Error('Invalid token'));
  }
}
