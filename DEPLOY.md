# Deploy no Railway

## Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Conta no [Stripe](https://dashboard.stripe.com)
3. Código no GitHub

---

## Passo 1: Subir código no GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/SEU_USER/SEU_REPO.git
git push -u origin main
```

---

## Passo 2: Criar projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub Repo**
3. Selecione o repositório

---

## Passo 3: Criar PostgreSQL e Redis

Dentro do projeto no Railway:

1. **New → Database → PostgreSQL**
2. **New → Database → Redis**

O Railway injeta automaticamente `DATABASE_URL` e `REDIS_URL` nos serviços.

---

## Passo 4: Configurar o Server

1. **New → GitHub Repo** → mesmo repositório
2. Renomear o serviço para `server` (clique no nome)
3. **Settings**:
   - **Dockerfile Path**: `Dockerfile.server`
4. **Variables** → **Raw Editor**:

```env
NODE_ENV=production
JWT_SECRET=<cole aqui o resultado de: openssl rand -hex 32>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-web.up.railway.app
FRONTEND_URL=https://seu-web.up.railway.app
```

5. **Settings → Networking → Generate Domain**
6. Anote a URL: `https://server-xxx.up.railway.app`

---

## Passo 5: Configurar o Frontend

1. **New → GitHub Repo** → mesmo repositório
2. Renomear o serviço para `web`
3. **Settings**:
   - **Dockerfile Path**: `Dockerfile.web`
4. **Settings → Networking → Generate Domain**
5. Anote a URL: `https://web-xxx.up.railway.app`

---

## Passo 6: Atualizar variáveis do Server

Volte no serviço **server** → **Variables** e atualize:

```env
CORS_ORIGIN=https://web-xxx.up.railway.app
FRONTEND_URL=https://web-xxx.up.railway.app
```

---

## Passo 7: Rodar migrations

No Railway CLI ou via Dashboard:

1. Vá no serviço **server**
2. Abra o **Shell** (ícone >_ no topo)
3. Execute:

```bash
npx prisma migrate deploy
```

---

## Passo 8: Seed (opcional)

No mesmo shell:

```bash
npx tsx src/database/seed.ts
```

---

## Passo 9: Configurar Stripe

1. No [Stripe Dashboard](https://dashboard.stripe.com) → **Products**
2. Crie 3 produtos (Starter $9, Pro $29, Enterprise $99)
3. Copie os Price IDs
4. Adicione no serviço **server** → **Variables**:

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...
```

5. No Stripe → **Developers → Webhooks → Add endpoint**:
   - URL: `https://server-xxx.up.railway.app/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Verificar

```bash
# Health check
curl https://server-xxx.up.railway.app/health

# Listar planos
curl https://server-xxx.up.railway.app/billing/plans

# Registrar usuário
curl -X POST https://server-xxx.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"password123"}'
```

---

## Erros comuns

### Build falha com "COPY failed"
- Verificou se o Dockerfile Path está correto? Deve ser `Dockerfile.server` ou `Dockerfile.web` (na raiz)

### Erro de conexão com banco
- O Railway injeta `DATABASE_URL` automaticamente do PostgreSQL
- Verifique se o serviço PostgreSQL está rodando

### Erro CORS
- `CORS_ORIGIN` deve ser exatamente a URL do frontend (com https://)

### Stripe webhook não funciona
- Use o Stripe CLI para testar localmente: `stripe listen --forward-to localhost:3000/billing/webhook`
