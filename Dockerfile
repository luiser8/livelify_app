# ---- Etapa 1: Build ----
    FROM node:22-alpine AS builder

    WORKDIR /app

    # --- VARIABLES DE ENTORNO PARA EL BUILD ---
    # Cloud Build NO pasa variables de build-time por defecto
    # Usamos valores por defecto seguros
    ARG VITE_API_URL=https://api.livelify.dev
    ENV VITE_API_URL=$VITE_API_URL

    # Variables para optimizar el build
    ENV NODE_ENV=production
    ENV CI=true

    RUN corepack enable

    # Copiar solo los archivos de dependencias primero (para cache)
    COPY package.json pnpm-lock.yaml* ./
    RUN pnpm install --frozen-lockfile

    # Copiar el resto del código
    COPY . .

    # Build de la aplicación
    RUN pnpm build

    # ---- Etapa 2: Serve ----
    FROM nginx:1.27-alpine

    # Instalar envsubst para variables de entorno
    RUN apk add --no-cache gettext

    # Crear directorio para templates de nginx
    RUN mkdir -p /etc/nginx/templates

    # Copiar configuración de nginx
    COPY nginx.conf /etc/nginx/templates/default.conf.template

    # Copiar archivos built
    COPY --from=builder /app/dist /usr/share/nginx/html

    # Crear usuario no-root para mayor seguridad
    RUN addgroup -g 1001 -S nginx-group && \
        adduser -S nginx-user -u 1001 -G nginx-group

    # Dar permisos al usuario nginx-user
    RUN chown -R nginx-user:nginx-group /var/cache/nginx && \
        chown -R nginx-user:nginx-group /var/log/nginx && \
        chown -R nginx-user:nginx-group /etc/nginx/conf.d && \
        chown -R nginx-user:nginx-group /usr/share/nginx/html

    # Cambiar a usuario no-root (IMPORTANTE para seguridad)
    USER nginx-user

    # Exponer puerto (Cloud Run usa 8080 por defecto)
    EXPOSE 8080

    # Health check para Cloud Run
    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
        CMD curl -f http://localhost:8080/health || exit 1

    # Comando de inicio optimizado
    CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]