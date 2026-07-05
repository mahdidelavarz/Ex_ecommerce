# frontend/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

FROM base AS deps
# Route every tarball in the lockfile through Chabokan's npm mirror.
RUN npm config set registry https://mirror2.chabokan.net/npm/ && \
    sed -i \
    -e 's|https://registry.npmmirror.com/|https://mirror2.chabokan.net/npm/|g' \
    -e 's|https://registry.npmjs.org/|https://mirror2.chabokan.net/npm/|g' \
    package-lock.json && \
    npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL=/api/v1
ARG INTERNAL_API_URL=http://backend:5000/api/v1
ARG NEXT_PUBLIC_SITE_URL=https://thenazishop.ir
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
