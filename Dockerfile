# Base image
FROM node:22-bookworm-slim AS base
RUN corepack enable

# Install dependencies with pinned Yarn
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Build the app
FROM base AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ ./src/
RUN yarn build && ls -la dist/

# Runtime image
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=LOCAL
WORKDIR /app
USER node
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["bash", "-lc", "curl -fsS http://localhost:3000/health || exit 1"]
CMD ["node", "dist/main.js"]
