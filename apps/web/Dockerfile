FROM node:20-slim AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
COPY apps/web/package.json ../apps/web/
RUN npm ci --workspace=@chat/web

# Copy source
COPY tsconfig.base.json ./
COPY apps/web/ ../apps/web/

# Build
RUN cd ../apps/web && npm run build

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "start"]
