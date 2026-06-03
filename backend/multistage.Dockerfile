# ==========================
# Stage 1 - Install Dependencies
# ==========================
FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev 

# ==========================
# Stage 2 - Production Image
# ==========================
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "src/server.js"]
