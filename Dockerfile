# Build stage
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Important: HEADSCALE_API_URL is a RUNTIME environment variable, not a build argument
# DO NOT set it here or pass it as --build-arg
# It will be read from process.env when the container runs
# This allows one image to work for all users with different Headscale servers
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
# Copy public folder
COPY --from=builder /app/public ./public

# Copy standalone output (contains server.js and dependencies)
# The standalone folder already contains the necessary server files
COPY --from=builder /app/.next/standalone ./

# Copy static files (CSS, JS, fonts, images)
# This must be copied to .next/static relative to the standalone output
# The path is relative to where server.js is located
COPY --from=builder /app/.next/static ./.next/static

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

