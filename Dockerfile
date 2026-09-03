# Stage 1: Build Angular storefront (monorepo / npm workspaces)
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# Stage 2: Serve with nginx (+ /api reverse proxy to backend service)
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/angular-ecommerce-3d/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
