# Guía de Estilos - Livelify

## Colores Personalizados

### Paleta de Colores Principal

#### Primary (Púrpura)
Color principal de la marca Livelify.

```tsx
// Uso en Tailwind
<div className="bg-primary-500">Primary</div>
<div className="text-primary-700">Primary Text</div>
<div className="border-primary-600">Primary Border</div>

// Escala completa
primary-50  → #f5f3ff (muy claro)
primary-100 → #ede9fe
primary-200 → #ddd6fe
primary-300 → #c4b5fd
primary-400 → #a78bfa
primary-500 → #8b5cf6 ⭐ Color base
primary-600 → #7c3aed
primary-700 → #6d28d9
primary-800 → #5b21b6
primary-900 → #4c1d95
primary-950 → #2e1065 (muy oscuro)
```

#### Secondary (Azul)
Color secundario para acentos y variaciones.

```tsx
secondary-500 → #3b82f6 ⭐ Color base
```

#### Accent (Magenta)
Color de acento para elementos destacados.

```tsx
accent-500 → #d946ef ⭐ Color base
```

#### Cream (Crema)
Color para botones primarios y fondos claros.

```tsx
// Uso
<div className="bg-cream">Cream Background</div>
<div className="bg-cream-dark">Darker Cream</div>

cream       → #fef3e2 ⭐ Base
cream-dark  → #fde8c3
```

## Gradientes

### Gradiente Principal de Livelify

```tsx
// Como clase
<div className="gradient-livelify">
  Contenido con gradiente
</div>

// Equivalente CSS
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #8b5cf6 100%);
```

## Animaciones Personalizadas

### Fade In
Animación de entrada suave con desplazamiento.

```tsx
// Fade in normal
<div className="animate-fade-in">Contenido</div>

// Fade in con delay
<div className="animate-fade-in-delay">Contenido</div>
```

## Ejemplos de Uso

### Botón Principal
```tsx
<button className="bg-cream text-primary-700 hover:bg-cream-dark">
  Click me
</button>
```

### Botón Secundario (Ghost)
```tsx
<button className="border-2 border-white/30 text-white hover:bg-white/10">
  Click me
</button>
```

### Card con Fondo
```tsx
<div className="bg-white p-6 rounded-lg shadow-md">
  <h3 className="text-primary-700">Título</h3>
  <p className="text-gray-600">Contenido</p>
</div>
```

### Overlay con Transparencia
```tsx
<div className="bg-white/20 backdrop-blur-sm">
  Contenido con blur
</div>
```

## Variables CSS Personalizadas

Todas las variables están definidas en `main.css` usando la directiva `@theme` de Tailwind v4.

```css
@theme {
  --color-primary-500: #8b5cf6;
  --color-cream: #fef3e2;
  /* etc... */
}
```

## Mejores Prácticas

1. **Usa las escalas de colores**: Siempre usa las variantes numéricas (50-950) para consistencia
2. **Transparencias**: Usa `/opacity` para transparencias (`bg-white/20`)
3. **Hover states**: Usa variantes más oscuras o claras según el contexto
4. **Accesibilidad**: Mantén buen contraste entre texto y fondo

## Configuración en Tailwind v4

Los colores se definen en `src/styles/main.css`:

```css
@theme {
  --color-primary-500: #8b5cf6;
}
```

Luego se usan como clases estándar de Tailwind:

```tsx
<div className="bg-primary-500" />
```

