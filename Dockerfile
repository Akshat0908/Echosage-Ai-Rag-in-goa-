FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source
COPY . .

# Cache-bust: forces fresh build on each deploy
ARG CACHEBUST=1

# Build the Nitro server for Node.js (not Cloudflare) with increased heap
RUN NITRO_PRESET=node-server NODE_OPTIONS="--max-old-space-size=4096" npm run build

EXPOSE 8080
ENV PORT=8080

CMD ["node", ".output/server/index.mjs"]
