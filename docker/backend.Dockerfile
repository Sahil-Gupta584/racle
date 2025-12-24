FROM node:22.12-alpine AS builder
WORKDIR /app

# Copy all package files first to leverage Docker cache
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/package*.json ./packages/database/
COPY packages/lib/package*.json ./packages/lib/
COPY packages/trpc/package*.json ./packages/trpc/

# Install turbo globally and all dependencies
RUN npm install -g turbo && npm install

# Copy the rest of the source code
COPY . .

# Remove web app to reduce build size
RUN rm -rf apps/web

# Generate Prisma client and build backend
RUN npm run db:generate
RUN npm run build:backend

FROM node:22.12-alpine AS runner
WORKDIR /app

# Install git for repository cloning and typescript globally
RUN apk add --no-cache git && npm install -g typescript

# Copy built backend
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy workspace packages (database, lib, trpc)
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/dist/prisma ./packages/database/dist/prisma

COPY --from=builder /app/packages/lib/dist ./packages/lib/dist
COPY --from=builder /app/packages/lib/package.json ./packages/lib/package.json

COPY --from=builder /app/packages/trpc/dist ./packages/trpc/dist
COPY --from=builder /app/packages/trpc/package.json ./packages/trpc/package.json

# Copy node_modules and root package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "/app/apps/backend/dist/server.js"]