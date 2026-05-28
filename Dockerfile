FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY templates ./templates
COPY migrations ./migrations
COPY scripts ./scripts

EXPOSE 4100

CMD ["node", "src/index.js"]
