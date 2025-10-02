# 🎨 Guía de Iconos para Livelify

## 📋 Opciones para Usar Iconos

Tienes **3 opciones principales** para agregar iconos a tu proyecto:

### ✅ **Opción 1: SVG Inline (Ya implementada)**

Esta es la opción que **ya estamos usando** en el proyecto. Es la más ligera y flexible.

**Ventajas:**
- ✅ No requiere dependencias adicionales
- ✅ Control total sobre tamaño y color
- ✅ Mejor rendimiento (no descarga librerías extras)
- ✅ Fácil de personalizar con Tailwind

**Cómo usar:**
```tsx
<svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
</svg>
```

**Dónde conseguir SVGs:**
- [Heroicons](https://heroicons.com/) - Iconos de Tailwind Labs ⭐ **RECOMENDADO**
- [Material Icons](https://fonts.google.com/icons)
- [Feather Icons](https://feathericons.com/)
- [Phosphor Icons](https://phosphoricons.com/)

---

### 🔥 **Opción 2: React Icons (Librería Popular)**

Una librería que incluye miles de iconos de diferentes sets.

**Instalación:**
```bash
pnpm add react-icons
```

**Sets de iconos incluidos:**
- Material Design (Md)
- Font Awesome (Fa)
- Heroicons (Hi)
- Feather (Fi)
- Bootstrap (Bs)
- Y muchos más...

**Uso:**
```tsx
import { FaHome, FaUser, FaPlus } from 'react-icons/fa';
import { HiHome, HiUser } from 'react-icons/hi';
import { MdDashboard } from 'react-icons/md';

<FaHome className="w-6 h-6 text-primary-600" />
<HiUser className="w-6 h-6" />
```

**Ejemplo en BottomNav:**
```tsx
import { 
  MdDashboard, 
  MdDonutLarge, 
  MdAdd, 
  MdList, 
  MdPerson 
} from 'react-icons/md';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: <MdDashboard />,
  },
  // ...
];
```

**Ventajas:**
- ✅ Fácil de usar
- ✅ Miles de iconos disponibles
- ✅ Actualizaciones automáticas
- ✅ Tamaños consistentes

**Desventajas:**
- ❌ Aumenta el bundle size
- ❌ Menos control sobre el SVG

---

### 🎯 **Opción 3: Lucide React (Moderna y Ligera)**

Una librería moderna, optimizada y con tree-shaking.

**Instalación:**
```bash
pnpm add lucide-react
```

**Uso:**
```tsx
import { Home, User, Plus, BarChart3, Menu } from 'lucide-react';

<Home className="w-6 h-6" />
<User className="w-6 h-6 text-primary-600" />
<Plus className="w-6 h-6" strokeWidth={3} />
```

**Ejemplo en BottomNav:**
```tsx
import { Home, BarChart3, Plus, List, User } from 'lucide-react';

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home className="w-6 h-6" />,
  },
  {
    id: 'wheel',
    label: 'Wheel',
    icon: <BarChart3 className="w-6 h-6" />,
  },
  // ...
];
```

**Ventajas:**
- ✅ Tree-shaking automático (solo importa lo que usas)
- ✅ Iconos modernos y consistentes
- ✅ Muy ligera
- ✅ Fácil personalización

---

## 🎨 Iconos para Life Wheel

Aquí están los iconos SVG específicos para cada área del Life Wheel:

### 1. Personal Development (Desarrollo Personal)
```tsx
<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z" />
</svg>
```

### 2. Professional Activity (Actividad Profesional)
```tsx
<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
</svg>
```

### 3. Health & Nutrition (Salud y Nutrición)
```tsx
<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 9h-4v4h-4v-4H6v-4h4V4h4v4h4v4z"/>
</svg>
```

### 4. Money & Finances (Dinero y Finanzas)
```tsx
<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
</svg>
```

### 5. Social Relationships (Relaciones Sociales)
```tsx
<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
</svg>
```

### 6. Couple & Intimacy (Pareja e Intimidad)
```tsx
<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
```

---

## 🎯 Navegación Inferior (BottomNav)

### Dashboard Icon
```tsx
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
</svg>
```

### Wheel/Chart Icon
```tsx
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
```

### Create/Plus Icon
```tsx
<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
</svg>
```

### Actions/List Icon
```tsx
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
</svg>
```

### Profile/User Icon
```tsx
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
```

---

## 🎨 Personalizar Colores

### Con Tailwind CSS (SVG inline):
```tsx
// Color del trazo
<svg className="w-6 h-6 text-primary-600" stroke="currentColor">

// Color de relleno
<svg className="w-6 h-6 text-red-500" fill="currentColor">

// Hover effects
<svg className="w-6 h-6 text-gray-500 hover:text-primary-600 transition-colors">
```

### Con React Icons:
```tsx
<FaHome className="w-6 h-6 text-primary-600" />
<FaHome size={24} color="#6366f1" />
```

### Con Lucide React:
```tsx
<Home className="w-6 h-6 text-primary-600" />
<Home size={24} color="#6366f1" strokeWidth={2.5} />
```

---

## 📝 Recomendación

Para este proyecto, **te recomiendo usar SVG inline** (ya implementado) porque:

1. ✅ Ya están todos los iconos necesarios
2. ✅ No aumenta el bundle size
3. ✅ Máxima flexibilidad con Tailwind
4. ✅ Rendimiento óptimo
5. ✅ Fácil de personalizar

Si necesitas **muchos más iconos** en el futuro, considera **Lucide React** por su ligereza y tree-shaking.

---

## 🔗 Recursos

- **Heroicons**: https://heroicons.com/
- **React Icons**: https://react-icons.github.io/react-icons/
- **Lucide**: https://lucide.dev/
- **SVG Repo**: https://www.svgrepo.com/
- **Iconify**: https://icon-sets.iconify.design/

