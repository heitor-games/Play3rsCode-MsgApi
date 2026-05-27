import { Router, Request, Response } from 'express';
import { getStripe } from './stripe';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Stripe webhook - needs raw body
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  let event: any;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    logger.error({ err }, 'Webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        logger.debug({ type: event.type }, 'Unhandled webhook event');
    }

    res.json({ received: true });
  } catch (err) {
    logger.error({ err, type: event.type }, 'Error processing webhook');
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleCheckoutCompleted(session: any) {
  const userId = session.metadata?.userId;
  const planTier = session.metadata?.planTier;

  if (!userId || !planTier) {
    logger.warn({ sessionId: session.id }, 'Missing metadata in checkout session');
    return;
  }

  const subscriptionId = session.subscription as string;
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const item = subscription.items.data[0];

  await prisma.subscription.update({
    where: { userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      plan: planTier as any,
      status: 'ACTIVE',
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
    },
  });

  logger.info({ userId, planTier, subscriptionId }, 'Checkout completed');
}

async function handleSubscriptionUpdated(subscription: any) {
  const customerId = subscription.customer as string;

  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) {
    logger.warn({ customerId }, 'Subscription not found for update');
    return;
  }

  const item = subscription.items.data[0];
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    canceled: 'CANCELED',
    past_due: 'PAST_DUE',
    trialing: 'TRIALING',
  };

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status: (statusMap[subscription.status] || 'ACTIVE') as any,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
    },
  });

  logger.info({ subscriptionId: subscription.id, status: subscription.status }, 'Subscription updated');
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer as string;

  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      plan: 'FREE',
      status: 'CANCELED',
      stripeSubscriptionId: null,
    },
  });

  logger.info({ userId: sub.userId }, 'Subscription canceled, reverted to Free');
}

async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer as string;

  const sub = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: 'PAST_DUE' },
  });

  logger.warn({ userId: sub.userId }, 'Payment failed, subscription past due');
}

export { router as webhookRouter };
