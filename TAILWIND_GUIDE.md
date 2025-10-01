# 🎨 Guía de Tailwind CSS en Livelify

Esta guía te ayudará a aprovechar al máximo Tailwind CSS v4 en tu proyecto.

## 📚 Recursos Principales

### Archivos de Configuración

1. **`tailwind.config.js`** - Configuración principal de Tailwind
2. **`postcss.config.js`** - Configuración de PostCSS
3. **`src/styles/main.css`** - Estilos globales y personalizados

## 🎯 Componentes Predefinidos

En `src/styles/main.css` encontrarás componentes reutilizables:

### Botones
```tsx
<button className="btn-primary">Botón Principal</button>
<button className="btn-secondary">Botón Secundario</button>
```

### Cards
```tsx
<div className="card">
  <h3>Título de la Card</h3>
  <p>Contenido...</p>
</div>
```

### Inputs
```tsx
<input type="text" className="input" placeholder="Escribe algo..." />
```

## 🎨 Colores Personalizados

### Primary (Azul)
```tsx
<div className="bg-primary-500 text-white">...</div>
<div className="bg-primary-100 text-primary-900">...</div>
```

### Secondary (Verde)
```tsx
<div className="bg-secondary-500 text-white">...</div>
<div className="bg-secondary-100 text-secondary-900">...</div>
```

## 🌙 Modo Oscuro

Tailwind está configurado con `darkMode: 'class'`. Para usarlo:

```tsx
// Agregar/quitar clase 'dark' al elemento html
document.documentElement.classList.toggle('dark')

// Usar en componentes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Contenido con modo oscuro
</div>
```

## ✨ Animaciones Personalizadas

### Fade In
```tsx
<div className="animate-fade-in">Aparece gradualmente</div>
```

### Slide Up
```tsx
<div className="animate-slide-up">Desliza hacia arriba</div>
```

### Slide Down
```tsx
<div className="animate-slide-down">Desliza hacia abajo</div>
```

## 🛠️ Utilidades Personalizadas

### Text Balance
```tsx
<h1 className="text-balance">Texto balanceado para títulos</h1>
```

### Scrollbar Hide
```tsx
<div className="scrollbar-hide overflow-auto">
  Contenido scrolleable sin scrollbar visible
</div>
```

## 📱 Responsive Design

Tailwind usa breakpoints mobile-first:

```tsx
<div className="
  text-sm        // Móvil (por defecto)
  sm:text-base   // >= 640px
  md:text-lg     // >= 768px
  lg:text-xl     // >= 1024px
  xl:text-2xl    // >= 1280px
  2xl:text-3xl   // >= 1536px
">
  Texto responsive
</div>
```

## 🎭 Layout Examples

### Container Centrado
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  Contenido centrado con padding responsive
</div>
```

### Grid Responsive
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
  <div className="card">Card 3</div>
</div>
```

### Flexbox
```tsx
<div className="flex flex-col md:flex-row items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## 🚀 Optimizaciones de Producción

El proyecto está configurado con:

- ✅ **PostCSS** - Procesamiento automático de CSS
- ✅ **Autoprefixer** - Prefijos automáticos para compatibilidad
- ✅ **cssnano** - Minificación en producción
- ✅ **PurgeCSS** - Eliminación de CSS no utilizado (integrado en Tailwind)

### Build de Producción
```bash
pnpm build
```

Esto generará un CSS optimizado con solo las clases que realmente usas.

## 💡 Tips y Mejores Prácticas

### 1. Usar @apply para componentes repetidos
En lugar de repetir clases, crea componentes en `main.css`:

```css
@layer components {
  .btn-custom {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600;
  }
}
```

### 2. Aprovechar las variables CSS
Define variables personalizadas en `:root`:

```css
:root {
  --color-brand: #646cff;
}
```

### 3. Usar group y peer para estados relacionados
```tsx
<div className="group">
  <button>Hover me</button>
  <div className="hidden group-hover:block">Aparece al hover del grupo</div>
</div>
```

### 4. Combinar con CSS Modules cuando sea necesario
Para estilos muy específicos, puedes combinar Tailwind con CSS tradicional.

## 📖 Recursos Adicionales

- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/components)
- [Heroicons](https://heroicons.com/) - Iconos SVG compatibles
- [Headless UI](https://headlessui.com/) - Componentes sin estilos

## 🎓 Ejemplos Prácticos

### Navbar con Backdrop Blur
```tsx
<nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
  {/* Contenido */}
</nav>
```

### Gradient Text
```tsx
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
  Texto con gradiente
</h1>
```

### Skeleton Loading
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
</div>
```

### Modal Overlay
```tsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="card max-w-md w-full mx-4">
    {/* Contenido del modal */}
  </div>
</div>
```

---

¡Disfruta construyendo con Tailwind CSS! 🎉
