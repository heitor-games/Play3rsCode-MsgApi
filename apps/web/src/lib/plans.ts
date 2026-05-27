export interface PlanLimits {
  messages: number;
  channels: number;
  connections: number;
  notifications: number;
}

export interface Plan {
  id: string;
  name: string;
  tier: string;
  priceMonthly: number;
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tier: "FREE",
    priceMonthly: 0,
    limits: {
      messages: 100,
      channels: 3,
      connections: 5,
      notifications: 10,
    },
    features: [
      "100 mensagens/mês",
      "3 canais",
      "5 conexões simultâneas",
      "10 notificações/mês",
      "Chat privado",
      "Suporte comunidade",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    tier: "STARTER",
    priceMonthly: 900,
    limits: {
      messages: 5000,
      channels: 20,
      connections: 50,
      notifications: 500,
    },
    features: [
      "5.000 mensagens/mês",
      "20 canais",
      "50 conexões simultâneas",
      "500 notificações/mês",
      "Chat privado + público",
      "API access",
      "Suporte email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tier: "PRO",
    priceMonthly: 2900,
    limits: {
      messages: 50000,
      channels: 100,
      connections: 500,
      notifications: 5000,
    },
    features: [
      "50.000 mensagens/mês",
      "100 canais",
      "500 conexões simultâneas",
      "5.000 notificações/mês",
      "Chat privado + público",
      "API access",
      "Webhooks",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "ENTERPRISE",
    priceMonthly: 9900,
    limits: {
      messages: Infinity,
      channels: Infinity,
      connections: Infinity,
      notifications: Infinity,
    },
    features: [
      "Mensagens ilimitadas",
      "Canais ilimitados",
      "Conexões ilimitadas",
      "Notificações ilimitadas",
      "Chat privado + público",
      "API access",
      "Webhooks",
      "SLA 99.9%",
      "Suporte dedicado",
      "Onboarding assistido",
    ],
  },
];

export function formatLimit(value: number): string {
  if (value === Infinity) return "Ilimitado";
  if (value >= 1000) return `${(value / 1000).toFixed(0).replace(".", ",")}k`;
  return value.toString();
}

export function formatPrice(cents: number): string {
  if (cents === 0) return "Grátis";
  return `$${(cents / 100).toFixed(0)}`;
}
