import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().optional().default('http://localhost:3001'),
  CORS_ORIGIN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('=== ENV VALIDATION FAILED ===');
    const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`);
    console.error(errors.join('\n'));
    console.error('=============================');
    process.exit(1);
  }
  console.log(`[env] PORT=${result.data.PORT}, NODE_ENV=${result.data.NODE_ENV}`);
  return result.data;
}
