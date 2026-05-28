import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { signToken, verifyToken } from './jwt';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const router = Router();

// Auth middleware for Express routes
function requireAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token required' });
  }

  try {
    const payload = verifyToken(token);
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid or expired token' });
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(6).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(body.password, 10);

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });

    if (existing) {
      throw AppError.conflict(
        existing.email === body.email
          ? 'Email already registered'
          : 'Username already taken'
      );
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        passwordHash,
      },
    });

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    logger.info({ userId: user.id }, 'User registered');

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.code, message: err.message });
    } else if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    } else {
      logger.error({ err }, 'Registration error');
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
    }
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastSeen: new Date() },
    });

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    logger.info({ userId: user.id }, 'User logged in');

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.code, message: err.message });
    } else if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    } else {
      logger.error({ err }, 'Login error');
      res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
    }
  }
});

// Get current user info
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatarUrl: true,
        isOnline: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'User not found' });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    res.json({
      user,
      subscription: subscription || { plan: 'FREE', status: 'ACTIVE' },
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching user');
    res.status(500).json({ error: 'INTERNAL', message: 'Internal server error' });
  }
});

export { router as authRouter };
