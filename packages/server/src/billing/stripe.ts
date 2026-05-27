import Stripe from 'stripe';
import { loadEnv } from '../config/env';

let stripeInstance: InstanceType<typeof Stripe>;

export function getStripe(): InstanceType<typeof Stripe> {
  if (!stripeInstance) {
    const env = loadEnv();
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(key);
  }
  return stripeInstance;
}
