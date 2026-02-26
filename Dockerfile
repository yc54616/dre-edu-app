# ── Stage 1: base ──────────────────────────────────────────────
FROM node:20-bookworm-slim AS base
WORKDIR /app

# ── Stage 2: deps ─────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 3: builder ──────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_TOSS_CLIENT_KEY
ARG NEXT_PUBLIC_DRE_NAVER_CAFE_URL

RUN npm run build

# Bundle seed script into a single JS file (node-only, externalize native deps)
RUN npx esbuild scripts/seed.ts \
      --bundle --platform=node --format=cjs \
      --outfile=dist/seed.js \
      --external:mongodb --external:mongoose \
      --external:bson --external:@mongodb-js/* --external:kerberos \
      --external:@aws-sdk/* --external:snappy --external:mongodb-client-encryption

# ── Stage 4: runner ───────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production

# Runtime system dependencies:
# - libreoffice (backports): HWPX support requires >= 24.x
# - poppler-utils: pdfinfo / pdftoppm (page count + preview)
# - python3 + pyhwp: hwp5proc / hwp5odt fallback
RUN echo "deb http://deb.debian.org/debian bookworm-backports main" \
      > /etc/apt/sources.list.d/backports.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends -t bookworm-backports \
    libreoffice \
  && apt-get install -y --no-install-recommends \
    poppler-utils \
    python3 \
    python3-pip \
    fonts-noto-cjk \
    fonts-nanum \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir --break-system-packages pyhwp==0.1b15 six

# Create non-root user with home directory (LibreOffice requires writable home)
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --home /home/nextjs nextjs

# Create required directories
RUN mkdir -p /app/uploads/files /app/public/uploads/previews /app/tmp \
  && chown -R nextjs:nodejs /app/uploads /app/public/uploads /app/tmp

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy bundled seed script
COPY --from=builder --chown=nextjs:nodejs /app/dist/seed.js ./seed.js

# Copy entrypoint
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]
