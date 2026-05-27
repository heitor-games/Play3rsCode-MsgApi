import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { loadEnv } from './config/env';
import { createSocketServer } from './socket';
import { authRouter } from './auth/routes';
import { billingRouter } from './billing/routes';
import { webhookRouter } from './billing/webhook';
import { NotificationManager } from './notifications/manager';
import { TwilioSMSProvider } from './notifications/twilio';
import { FirebasePushProvider } from './notifications/firebase';
import { logger } from './utils/logger';

const env = loadEnv();
const app = express();
const httpServer = createServer(app);

// CORS - allow frontend origin in production
const corsOrigin = process.env.CORS_ORIGIN || (env.NODE_ENV === 'production' ? false : '*');
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Stripe webhook needs raw body for signature verification
app.use('/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.use('/auth', authRouter);

// Billing routes
app.use('/billing', billingRouter);
app.use('/billing', webhookRouter);

// Notification providers (stubs)
const notificationManager = new NotificationManager();
notificationManager.register(new TwilioSMSProvider());
notificationManager.register(new FirebasePushProvider());

// Make notification manager available to routes
app.locals.notificationManager = notificationManager;

// Socket.IO
const io = createSocketServer(httpServer);

// Start server
httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Server started');
  logger.info('WebSocket server ready');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  io.close();
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  io.close();
  httpServer.close(() => process.exit(0));
});
