# Monorepo workspace build — Docker context must be the repository root.
# See render.yaml (rootDir: .) and docs/GETTING_STARTED.md.

FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --include=dev

COPY backend ./backend

RUN npm run build --workspace=angular-ecommerce-backend

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci --omit=dev --workspace=angular-ecommerce-backend

COPY --from=build /app/backend/dist ./backend/dist

WORKDIR /app/backend

RUN mkdir -p uploads

EXPOSE 3002

CMD ["node", "dist/main.js"]
