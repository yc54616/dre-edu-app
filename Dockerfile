FROM node:20-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Runtime system dependencies:
# - libreoffice: HWP/HWPX -> PDF conversion
# - poppler-utils: pdfinfo / pdftoppm (page count + preview)
# - python3 + pyhwp: hwp5proc / hwp5odt fallback
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libreoffice \
    poppler-utils \
    python3 \
    python3-pip \
    fonts-noto-cjk \
    fonts-nanum \
    ca-certificates \
  && if apt-cache show libreoffice-h2orestart > /dev/null 2>&1; then \
       apt-get install -y --no-install-recommends libreoffice-h2orestart; \
     else \
       echo "libreoffice-h2orestart not available in this distro; skipping"; \
     fi \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install --no-cache-dir pyhwp==0.1b15

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# upload/tmp directories are used by preview/page-count workers
RUN mkdir -p /app/uploads/files /app/public/uploads/previews /app/tmp

EXPOSE 3000
CMD ["node", "server.js"]
