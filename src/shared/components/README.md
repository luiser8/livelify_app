# Componentes Compartidos

Esta carpeta contiene componentes reutilizables que pueden ser usados en cualquier parte de la aplicación.

## Componentes Disponibles

### Button
Botón personalizable con diferentes variantes y tamaños.

**Uso:**
```tsx
import { Button } from '@/shared/components';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- Todos los props nativos de HTMLButtonElement

### Footer
Footer simple que muestra información del creador del sitio. Se utiliza únicamente en la página de onboarding (landing page).

**Uso:**
```tsx
import { Footer } from '@/shared/components';

<Footer />
```

**Características:**
- Diseño limpio y minimalista
- Se integra naturalmente en el flujo del documento (no fijo)
- Texto con transparencia para adaptarse al fondo
- Muestra "Creado por flowpartners" (traducido automáticamente)
- Soporta internacionalización (i18n) - EN: "Created by", ES: "Creado por"
- Solo visible en la ruta raíz (/)

## Agregar Nuevos Componentes

1. Crear carpeta con el nombre del componente
2. Crear archivo `ComponentName.tsx`
3. Crear archivo `index.ts` para exportar
4. Agregar a `/shared/components/index.ts`

```
Button/
├── Button.tsx
├── Button.test.tsx (opcional)
└── index.ts
```

