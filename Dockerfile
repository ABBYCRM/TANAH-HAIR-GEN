# TANAH-HAIR-GEN Dockerfile — multi-stage build, non-root, port 8080.
# Build:  docker build -t tanah-hair-gen .
# Run:    docker run --rm -p 8080:8080 -e GEMINI_API_KEY=... tanah-hair-gen

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

# Non-root user for runtime hardening
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app

# Copy deps + source
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY app ./app

# Health check used by DigitalOcean App Platform (HTTP path /api/health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1

USER app
EXPOSE 8080
CMD ["node", "app/server.mjs"]
