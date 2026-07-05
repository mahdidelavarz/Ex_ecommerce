# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://mirror2.chabokan.net/npm/ && \
    sed -i \
    -e 's|https://registry.npmmirror.com/|https://mirror2.chabokan.net/npm/|g' \
    -e 's|https://registry.npmjs.org/|https://mirror2.chabokan.net/npm/|g' \
    package-lock.json && \
    npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm config set registry https://mirror2.chabokan.net/npm/ && \
    sed -i \
    -e 's|https://registry.npmmirror.com/|https://mirror2.chabokan.net/npm/|g' \
    -e 's|https://registry.npmjs.org/|https://mirror2.chabokan.net/npm/|g' \
    package-lock.json && \
    npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
