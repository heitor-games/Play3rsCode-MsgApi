export interface PlanLimits {
  messages: number;
  channels: number;
  connections: number;
  notifications: number;
}

export interface PlanDefinition {
  id: string;
  name: string;
  tier: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  priceMonthly: number; // cents
  priceId: string | null; // Stripe Price ID (null for free)
  limits: PlanLimits;
  features: string[];
}

export const PLANS: Record<string, PlanDefinition> = {
  FREE: {
    id: 'free',
    name: 'Free',
    tier: 'FREE',
    priceMonthly: 0,
    priceId: null,
    limits: {
      messages: 100,
      channels: 3,
      connections: 5,
      notifications: 10,
    },
    features: [
      '100 mensagens/mês',
      '3 canais',
      '5 conexões simultâneas',
      '10 notificações/mês',
      'Chat privado',
      'Suporte comunidade',
    ],
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    tier: 'STARTER',
    priceMonthly: 900, // $9.00
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    limits: {
      messages: 5_000,
      channels: 20,
      connections: 50,
      notifications: 500,
    },
    features: [
      '5.000 mensagens/mês',
      '20 canais',
      '50 conexões simultâneas',
      '500 notificações/mês',
      'Chat privado + público',
      'API access',
      'Suporte email',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    tier: 'PRO',
    priceMonthly: 2900, // $29.00
    priceId: process.env.STRIPE_PRICE_PRO || '',
    limits: {
      messages: 50_000,
      channels: 100,
      connections: 500,
      notifications: 5_000,
    },
    features: [
      '50.000 mensagens/mês',
      '100 canais',
      '500 conexões simultâneas',
      '5.000 notificações/mês',
      'Chat privado + público',
      'API access',
      'Webhooks',
      'Suporte prioritário',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    priceMonthly: 9900, // $99.00
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    limits: {
      messages: Infinity,
      channels: Infinity,
      connections: Infinity,
      notifications: Infinity,
    },
    features: [
      'Mensagens ilimitadas',
      'Canais ilimitados',
      'Conexões ilimitadas',
      'Notificações ilimitadas',
      'Chat privado + público',
      'API access',
      'Webhooks',
      'SLA 99.9%',
      'Suporte dedicado',
      'Onboarding assistido',
    ],
  },
};

export function getPlanByTier(tier: string): PlanDefinition {
  return PLANS[tier] || PLANS.FREE;
}

export function getPlanLimits(tier: string): PlanLimits {
  return getPlanByTier(tier).limits;
}

export function getAllPlans(): PlanDefinition[] {
  return Object.values(PLANS);
}
