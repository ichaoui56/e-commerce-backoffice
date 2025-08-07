# Base image
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies layer: copy only lockfiles first
FROM base AS deps
COPY package.json pnpm-lock.yaml ./

# Builder layer
FROM base AS builder

# Accept build argument for DATABASE_URL
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npm install -g pnpm
WORKDIR /app

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY . .

RUN pnpm install --frozen-lockfile

# Generate Prisma client and push schema
RUN npx prisma generate

RUN pnpm run build

# Production runner layer
FROM base AS runner

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# DATABASE_URL must be set in Railway environment variables

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy Prisma runtime files
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
