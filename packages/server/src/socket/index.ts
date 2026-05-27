import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware } from '../auth/middleware';
import { registerAllHandlers } from './handlers';
import { logger } from '../utils/logger';

export function createSocketServer(httpServer: HttpServer): Server {
  const corsOrigin = process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : '*');
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware
  io.use(socketAuthMiddleware);

  // Connection handler
  io.on('connection', (socket) => {
    logger.info({
      socketId: socket.id,
      userId: socket.data.userId,
      username: socket.data.username,
    }, 'Socket connected');

    registerAllHandlers(io, socket);
  });

  return io;
}
