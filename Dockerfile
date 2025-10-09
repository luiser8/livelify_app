# ---- Etapa 1: Build ----
# Se utiliza una imagen de Node.js para instalar dependencias y compilar el código.
FROM node:22-alpine AS builder

# Se establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# --- AÑADIDO: Declarar argumentos para las variables de entorno ---
# Añade una línea ARG por cada variable que tu build necesite.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Se habilita pnpm a través de corepack, el método recomendado.
RUN corepack enable

# Se copian los archivos de dependencias de pnpm para aprovechar el caché de Docker.
COPY package.json pnpm-lock.yaml* ./

# Se instalan las dependencias del proyecto usando pnpm.
RUN pnpm install
#--unsafe-perm

# Se copia el resto del código fuente.
COPY . .

# Se ejecuta el script de build para generar los archivos estáticos de producción.
RUN pnpm build


# ---- Etapa 2: Serve ----
# Se utiliza una imagen ligera de Nginx para servir los archivos estáticos.
FROM nginx:1.27-alpine

# Se copia la configuración personalizada de Nginx. Este archivo le dirá a Nginx
# que escuche en el puerto que Cloud Run le asigne.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Se copian los archivos generados en la etapa de 'build' al directorio de Nginx.
COPY --from=builder /app/dist /usr/share/nginx/html

# Se expone el puerto 8080, que es el que Cloud Run utiliza por defecto.
EXPOSE 8080

# El comando de inicio ahora primero procesa la plantilla de configuración para
# inyectar la variable de entorno PORT y luego inicia Nginx.
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

