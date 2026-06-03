# Stage 1
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# Stage 2
FROM gcr.io/distroless/nodejs22-debian12

WORKDIR /app

COPY --from=builder /app .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["src/server.js"]
