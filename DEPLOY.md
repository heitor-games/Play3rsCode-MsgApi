# Deploy no Railway

## Pré-requisitos

1. Conta no [Railway](https://railway.app) (free tier disponível)
2. Conta no [Stripe](https://dashboard.stripe.com) (modo teste primeiro)
3. CLI do Railway instalado: `npm i -g @railway/cli`

---

## Passo 1: Login no Railway

```bash
railway login
```

---

## Passo 2: Criar o projeto

```bash
railway init
# Nome: realtime-chat-api
```

---

## Passo 3: Criar os serviços de infraestrutura

No Dashboard do Railway (web), dentro do projeto:

### PostgreSQL
1. **New → Database → PostgreSQL**
2. Railway cria automaticamente e injeta `DATABASE_URL`

### Redis
1. **New → Database → Redis**
2. Railway cria automaticamente e injeta `REDIS_URL`

---

## Passo 4: Deploy do Server (API)

### Opção A: Via CLI

```bash
# No root do projeto
railway link  # selecionar o projeto

# Criar serviço para o server
railway add --service server

# Conectar ao PostgreSQL e Redis (via variáveis de ambiente)
# As variáveis DATABASE_URL e REDIS_URL são injetadas automaticamente

# Deploy
railway up --service server
```

### Opção B: Via Dashboard

1. **New → GitHub Repo** → selecionar o repositório
2. **Settings → Root Directory**: `/`
3. **Settings → Dockerfile Path**: `packages/server/Dockerfile`
4. **Settings → Watch Paths**: `packages/server/**`, `packages/shared/**`

---

## Passo 5: Deploy do Frontend (Next.js)

### Opção A: Via CLI

```bash
railway add --service web
railway up --service web
```

### Opção B: Via Dashboard

1. **New → GitHub Repo** → mesmo repositório
2. **Settings → Root Directory**: `/`
3. **Settings → Dockerfile Path**: `apps/web/Dockerfile`
4. **Settings → Watch Paths**: `apps/web/**`

---

## Passo 6: Configurar variáveis de ambiente

### No serviço Server (via Dashboard → Variables)

```env
# Railway injeta automaticamente:
# DATABASE_URL, REDIS_URL (do PostgreSQL e Redis)

# Você precisa configurar:
NODE_ENV=production
JWT_SECRET=<gerar com: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-web.up.railway.app
FRONTEND_URL=https://seu-web.up.railway.app

# Stripe (depois de criar os produtos)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

### No serviço Web (via Dashboard → Variables)

```env
# Nenhuma variável obrigatória para o frontend estático
# O Next.js usa valores hardcoded do plans.ts
```

---

## Passo 7: Configurar variáveis compartilhadas

No Dashboard → **Variables → Shared Variables**:

```env
# Para que o server conheça a URL do frontend
FRONTEND_URL=https://seu-web.up.railway.app
```

---

## Passo 8: Gerar URL pública

1. No serviço **Server** → **Settings → Networking → Generate Domain**
2. No serviço **Web** → **Settings → Networking → Generate Domain**

Resultado:
- Server: `https://server-production-xxxx.up.railway.app`
- Web: `https://web-production-xxxx.up.railway.app`

---

## Passo 9: Rodar migrations

```bash
# Via CLI do Railway
railway run --service server npx prisma migrate deploy

# Ou via Dashboard → Service → Deploy Logs (deve rodar automaticamente via CMD do Dockerfile)
```

---

## Passo 10: Seed (opcional)

```bash
railway run --service server npx tsx src/database/seed.ts
```

---

## Passo 11: Configurar Stripe Webhook

1. Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Criar webhook no Dashboard:
   - URL: `https://server-production-xxxx.up.railway.app/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copiar o Signing Secret para `STRIPE_WEBHOOK_SECRET`

---

## Verificação

```bash
# Health check
curl https://server-production-xxxx.up.railway.app/health

# Registrar usuário
curl -X POST https://server-production-xxxx.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'

# Listar planos
curl https://server-production-xxxx.up.railway.app/billing/plans
```

---

## Troubleshooting

### Build falha
- Verificar se o Dockerfile está correto
- Conferir os logs: Dashboard → Service → Deploy Logs

### Erro de conexão com banco
- Verificar se `DATABASE_URL` está configurada
- O PostgreSQL do Railway só aceita conexões externas se configurado

### CORS bloqueado
- Verificar se `CORS_ORIGIN` aponta para a URL correta do frontend

### Stripe webhook não funciona
- Verificar se a URL do webhook está correta
- Verificar se `STRIPE_WEBHOOK_SECRET` está configurado
- Testar com: `stripe trigger checkout.session.completed`
