FROM node:20-slim AS base

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY packages/shared/package.json ../packages/shared/
COPY packages/server/package.json ../packages/server/
RUN npm ci --workspace=@chat/server --workspace=@chat/shared

# Copy source
COPY tsconfig.base.json ./
COPY packages/shared/ ../packages/shared/
COPY packages/server/ ../packages/server/

# Build shared
RUN cd ../packages/shared && npx tsc

# Generate Prisma client
RUN cd ../packages/server && npx prisma generate

# Build server
RUN cd ../packages/server && npx tsc

WORKDIR /app/packages/server

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
