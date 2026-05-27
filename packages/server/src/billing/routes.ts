import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { getStripe } from './stripe';
import { getAllPlans, getPlanByTier } from './plans';
import { requireAuth, requirePlanTier } from './middleware';
import { getAllUsage, syncUsageToDb } from './usage';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const router = Router();

// Public: list plans
router.get('/plans', (_req: Request, res: Response) => {
  res.json({ plans: getAllPlans() });
});

// Protected: current subscription
router.get('/subscription', requireAuth, requirePlanTier, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.userId },
    });

    const plan = getPlanByTier(subscription?.plan || 'FREE');

    res.json({
      subscription: subscription || { plan: 'FREE', status: 'ACTIVE' },
      plan,
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching subscription');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to fetch subscription' });
  }
});

// Protected: current usage
router.get('/usage', requireAuth, async (req: Request, res: Response) => {
  try {
    const usage = await getAllUsage(req.user!.userId);
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.userId },
    });

    const plan = getPlanByTier(subscription?.plan || 'FREE');

    res.json({
      usage,
      limits: plan.limits,
      plan: plan.name,
    });
  } catch (err) {
    logger.error({ err }, 'Error fetching usage');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to fetch usage' });
  }
});

// Protected: create checkout session
const checkoutSchema = z.object({
  plan: z.enum(['STARTER', 'PRO', 'ENTERPRISE']),
});

router.post('/checkout', requireAuth, async (req: Request, res: Response) => {
  try {
    const { plan: planTier } = checkoutSchema.parse(req.body);
    const plan = getPlanByTier(planTier);

    if (!plan.priceId) {
      return res.status(400).json({ error: 'INVALID_PLAN', message: 'Plan not available for checkout' });
    }

    const stripe = getStripe();
    const userId = req.user!.userId;

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId },
      });
      customerId = customer.id;

      // Create subscription record
      await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId: customerId!,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/pricing`,
      metadata: { userId, planTier },
    });

    res.json({ url: session.url });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    logger.error({ err }, 'Error creating checkout session');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to create checkout session' });
  }
});

// Protected: create customer portal
router.post('/portal', requireAuth, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.userId },
    });

    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'NO_SUBSCRIPTION', message: 'No active subscription' });
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, 'Error creating portal session');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to create portal session' });
  }
});

// API Keys
const apiKeySchema = z.object({
  name: z.string().min(1).max(50),
});

router.post('/api-keys', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name } = apiKeySchema.parse(req.body);
    const key = `sk_live_${crypto.randomBytes(32).toString('hex')}`;

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: req.user!.userId,
        key,
        name,
      },
    });

    res.status(201).json({ id: apiKey.id, name: apiKey.name, key: apiKey.key, createdAt: apiKey.createdAt });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: err.errors });
    }
    logger.error({ err }, 'Error creating API key');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to create API key' });
  }
});

router.get('/api-keys', requireAuth, async (req: Request, res: Response) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user!.userId },
      select: { id: true, name: true, isActive: true, lastUsedAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ keys });
  } catch (err) {
    logger.error({ err }, 'Error listing API keys');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to list API keys' });
  }
});

router.delete('/api-keys/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const keyId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: keyId, userId: req.user!.userId },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'API key not found' });
    }

    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { isActive: false },
    });

    res.json({ message: 'API key revoked' });
  } catch (err) {
    logger.error({ err }, 'Error revoking API key');
    res.status(500).json({ error: 'INTERNAL', message: 'Failed to revoke API key' });
  }
});

export { router as billingRouter };
