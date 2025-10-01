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

