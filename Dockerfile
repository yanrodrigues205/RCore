FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

ARG API_PORT=3000
ARG TCP_PORT=5000

ENV API_PORT=${API_PORT}
ENV TCP_PORT=${TCP_PORT}

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.js ./prisma.config.js
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE ${API_PORT}
EXPOSE ${TCP_PORT}/tcp

CMD ["node", "dist/main.js"]