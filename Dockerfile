# ---- Etapa 1: Build ----
# Se utiliza una imagen de Node.js para instalar dependencias y compilar el código.
FROM node:22-alpine AS builder

# Se establece el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Se habilita pnpm a través de corepack, el método recomendado.
RUN corepack enable

# Se copian los archivos de dependencias de pnpm para aprovechar el caché de Docker.
COPY package.json pnpm-lock.yaml* ./

# Se instalan las dependencias del proyecto usando pnpm.
RUN pnpm install

# Se copia el resto del código fuente.
COPY . .

# Se ejecuta el script de build para generar los archivos estáticos de producción.
RUN pnpm run build


# ---- Etapa 2: Serve ----
# Se utiliza una imagen ligera de Nginx para servir los archivos estáticos.
FROM nginx:1.27-alpine

# Se copian los archivos generados en la etapa de 'build' al directorio de Nginx.
COPY --from=builder /app/build /usr/share/nginx/html

# Se expone el puerto 80, que es el puerto por defecto de Nginx.
EXPOSE 80

# El comando por defecto de la imagen de Nginx iniciará el servidor web.
CMD ["nginx", "-g", "daemon off;"]
