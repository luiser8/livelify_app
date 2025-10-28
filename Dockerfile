# ---- Etapa 1: Build ----
    FROM node:22-alpine AS builder

    WORKDIR /app

    # Variables de entorno para el build
    ARG VITE_API_URL=https://api.livelify.dev
    ENV VITE_API_URL=$VITE_API_URL
    ENV NODE_ENV=production

    RUN corepack enable

    COPY package.json pnpm-lock.yaml* ./
    RUN pnpm install --frozen-lockfile

    COPY . .
    RUN pnpm build

    # ---- Etapa 2: Serve ----
    FROM nginx:1.27-alpine

    # Instalar envsubst para variables de entorno
    RUN apk add --no-cache gettext

    # Copiar configuración CORREGIDA de nginx
    COPY nginx.conf /etc/nginx/templates/default.conf.template

    # Copiar archivos built de React
    COPY --from=builder /app/dist /usr/share/nginx/html

    # Exponer puerto (Cloud Run usa 8080)
    EXPOSE 8080

    # Comando de inicio SIMPLIFICADO y CORREGIDO
    CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]