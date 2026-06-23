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
ENV PORT=3000
ENV DB_HOST=mysql
ENV DB_PORT=3306
ENV DB_USER=impulse
ENV DB_PASSWORD=impulse123
ENV DB_NAME=impulse_fitness

EXPOSE 3000

CMD ["node", "server.js"]
