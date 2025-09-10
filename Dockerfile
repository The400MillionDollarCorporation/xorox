# Next.js + Solana Dockerfile - Node.js 20+ required for Solana packages (Yarn Only)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install native dependencies required for Solana packages and USB support
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev \
    libusb-dev \
    eudev-dev

# Enable Yarn
RUN corepack enable yarn

WORKDIR /app

# Copy package files directly from build context root
COPY frontend/package.json frontend/yarn.lock ./

# Debug: Show what files are available
RUN echo "Available files in /app:" && ls -la

# Install dependencies with Yarn (ignore optional dependencies that might cause issues)
RUN yarn install --frozen-lockfile --network-timeout 300000 --ignore-optional

# Rebuild the source code only when needed
FROM base AS builder
# Install build dependencies in builder stage
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig

RUN corepack enable yarn
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
#COPY frontend ./                   # Copy the rest of the client app

# Copy environment file for build (if needed for build-time env vars)
# Note: Build-time environment variables should be prefixed with NEXT_PUBLIC_
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with Yarn
COPY frontend/package.json frontend/yarn.lock frontend/ /app
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
# Only install runtime dependencies needed for USB and other native modules
RUN apk add --no-cache \
    libusb \
    eudev-libs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js application
CMD ["node", "server.js"]
