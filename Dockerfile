FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ── Instalar dependencias ──
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod=false

# ── Compilar ──
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY apps/server/ apps/server/
RUN pnpm --filter @scpeak/server build

# ── Imagen final (solo runtime) ──
FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/server/package.json ./apps/server/
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/server/drizzle.config.ts ./apps/server/
COPY package.json pnpm-workspace.yaml ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "apps/server/dist/index.js"]
