import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../auth/jwt';
import { prisma } from '../config/database';
import { checkUsageLimit, MetricType } from './usage';
import { logger } from '../utils/logger';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      planTier?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // Also check API key
  const apiKey = req.headers['x-api-key'] as string;

  if (!token && !apiKey) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = payload;
      return next();
    } catch {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired token' });
    }
  }

  // API key auth - handled async
  authenticateApiKey(apiKey)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'INVALID_API_KEY', message: 'Invalid API key' });
      }
      req.user = { userId: user.id, username: user.username, email: user.email };
      next();
    })
    .catch(() => {
      res.status(500).json({ error: 'INTERNAL', message: 'Authentication error' });
    });
}

async function authenticateApiKey(key: string) {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key, isActive: true },
    include: { user: { select: { id: true, username: true, email: true } } },
  });

  if (!apiKey) return null;

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey.user;
}

export async function requirePlanTier(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: req.user.userId },
  });

  req.planTier = subscription?.plan || 'FREE';
  next();
}

export function requireUsageLimit(metric: MetricType) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    const planTier = req.planTier || 'FREE';
    const { allowed, current, limit } = await checkUsageLimit(req.user.userId, metric, planTier);

    if (!allowed) {
      return res.status(429).json({
        error: 'USAGE_LIMIT_EXCEEDED',
        message: `Usage limit exceeded for ${metric}`,
        current,
        limit,
        upgradeUrl: '/billing/plans',
      });
    }

    next();
  };
}
