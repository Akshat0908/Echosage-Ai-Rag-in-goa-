FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Build the Nitro server (increase heap for the 57MB corpus)
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

EXPOSE 8080
ENV PORT=8080

CMD ["node", ".output/server/index.mjs"]
