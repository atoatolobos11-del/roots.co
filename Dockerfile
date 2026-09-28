# syntax=docker/dockerfile:1

# ---------- 1. Install dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 2. Build the production bundle ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Regenerates the original vector artwork in public/images, then bundles.
RUN npm run build

# ---------- 3. Serve the static build ----------
FROM nginx:1.27-alpine AS runtime
LABEL org.opencontainers.image.title="ROOT.CO" \
      org.opencontainers.image.description="Responsive fashion e-commerce portfolio UI (React + Tailwind CSS)"

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# nginx binds IPv4 only, and "localhost" resolves to ::1 first inside the
# container, so the healthcheck must target 127.0.0.1 explicitly.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
