# Livelify Web App

Aplicación web moderna construida con React 18, Vite y TypeScript.

## 🚀 Tecnologías

- **React 19.1.1** - Librería de UI
- **TypeScript 5.9** - Tipado estático
- **Vite 7.1** - Build tool y dev server ultra rápido
- **Tailwind CSS 4.1** - Framework de utilidades CSS
- **React Router 7.9** - Enrutamiento
- **PostCSS** - Procesamiento de CSS
- **ESLint** - Linting de código

## 📋 Requisitos previos

- Node.js 18+ 
- npm, yarn o pnpm

## 🛠️ Instalación

Instala las dependencias:

```bash
npm install
```

## 💻 Comandos disponibles

### Modo desarrollo
```bash
pnpm dev                 # Desarrollo estándar
pnpm start:dev          # Desarrollo con env development
pnpm start:qa           # Desarrollo con env qa
pnpm start:debug        # Desarrollo con debug
pnpm start:debug:qa     # QA con debug
```

### Build
```bash
pnpm build              # Build estándar
pnpm build:dev          # Build para development
pnpm build:qa           # Build para qa
pnpm build:prod         # Build para production
```

### Preview y otros
```bash
pnpm preview            # Preview del build
pnpm start:prod         # Preview en modo producción
pnpm lint              # Verificar código con ESLint
```

## 🔐 Variables de entorno

Crea archivos `.env` según el entorno que necesites:

- `.env.development` - Variables para desarrollo
- `.env.qa` - Variables para QA
- `.env.production` - Variables para producción
- `.env.local` - Variables locales (no se suben a git)

### Ejemplo de variables:
```bash
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Livelify
VITE_APP_VERSION=0.1.0
```

**Importante:** Las variables deben comenzar con `VITE_` para estar disponibles en el cliente.

### Usar variables en el código:
```typescript
import { env } from './config/env'

console.log(env.API_URL)
console.log(env.APP_ENV)
```

## 📁 Estructura del proyecto

Este proyecto sigue una **Arquitectura Limpia** adaptada para React. Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para más detalles.

```
livelify_webapp/
├── public/                    # Archivos estáticos
├── src/
│   ├── core/                 # 🎯 Lógica de negocio pura
│   │   ├── entities/        # Modelos de dominio
│   │   └── usecases/        # Casos de uso
│   │
│   ├── features/            # 🎨 Módulos de la aplicación
│   │   └── home/
│   │       ├── components/  # Componentes del módulo
│   │       ├── hooks/       # Hooks del módulo
│   │       └── pages/       # Páginas del módulo
│   │
│   ├── shared/              # 🔧 Código compartido
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   │
│   ├── infrastructure/      # 🌐 Servicios externos
│   │   ├── api/            # Cliente API
│   │   └── services/       # Servicios (auth, etc.)
│   │
│   ├── routes/             # 🛣️ Configuración de rutas
│   ├── config/             # ⚙️ Configuraciones
│   ├── styles/             # 🎨 Estilos globales
│   ├── App.tsx             # Componente raíz
│   └── main.tsx            # Punto de entrada
│
├── ARCHITECTURE.md         # 📚 Documentación de arquitectura
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.cjs
```

## 🎨 Características

### Arquitectura
- 🏗️ Arquitectura Limpia (Clean Architecture)
- 📦 Separación de responsabilidades por capas
- 🔄 Flujo de datos unidireccional
- 🧪 Fácil de testear y mantener
- 📈 Escalable y organizada

### Desarrollo
- ⚡️ Hot Module Replacement (HMR) ultra rápido con Vite
- 🔷 TypeScript con configuración estricta
- 🎨 Tailwind CSS v4 (nueva sintaxis con `@import`)
- 📏 ESLint configurado con reglas modernas
- 🔐 Variables de entorno tipadas por ambiente
- 🎯 Path aliases (@/core, @/shared, etc.)

### UI/UX
- 🎭 Componentes reutilizables con Tailwind
- 📱 Diseño responsive mobile-first
- 🔄 Animaciones y transiciones suaves
- ♿️ Accesibilidad integrada

### Performance
- 📦 Code splitting automático
- ⚡ Optimización de bundle
- 🚀 Lazy loading de rutas

## 📝 Guía de inicio rápido

1. **Instala las dependencias**:
   ```bash
   pnpm install
   ```

2. **Configura las variables de entorno**:
   ```bash
   # Copia el template y configura tus variables
   cp ENV_TEMPLATE.txt .env.development
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   pnpm start:dev
   ```

4. **Comienza a desarrollar**:
   - Lee la [documentación de arquitectura](./ARCHITECTURE.md)
   - Crea una nueva feature en `src/features/`
   - Usa componentes compartidos de `src/shared/components/`

## 📖 Documentación adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Guía completa de la arquitectura
- [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md) - Guía de Tailwind CSS v4
- [src/shared/components/README.md](./src/shared/components/README.md) - Componentes compartidos

## 🤝 Contribuir

Este proyecto está en desarrollo activo. ¡Todas las contribuciones son bienvenidas!

---

Desarrollado con ❤️ usando React + Vite + TypeScript