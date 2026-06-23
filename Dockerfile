FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.js db.js ./
COPY routes ./routes
COPY middleware ./middleware
COPY database ./database
COPY --from=client-build /app/client/dist ./client/dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
