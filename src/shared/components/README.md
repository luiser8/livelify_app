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

### ConfirmModal
Modal de confirmación reutilizable para acciones críticas (eliminar, confirmar cambios, etc.).

**Uso:**
```tsx
import { ConfirmModal } from '@/shared/components';

const [showModal, setShowModal] = useState(false);
const [isLoading, setIsLoading] = useState(false);

const handleConfirm = async () => {
  setIsLoading(true);
  // Realizar acción
  await deleteItem();
  setIsLoading(false);
  setShowModal(false);
};

<ConfirmModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleConfirm}
  title="Eliminar Elemento"
  message="¿Estás seguro de que deseas eliminar este elemento?"
  confirmText="Sí, Eliminar"
  cancelText="Cancelar"
  confirmButtonClass="bg-red-600 hover:bg-red-700"
  isLoading={isLoading}
/>
```

**Props:**
- `isOpen`: boolean - Controla la visibilidad del modal
- `onClose`: () => void - Función para cerrar el modal
- `onConfirm`: () => void - Función que se ejecuta al confirmar
- `title`: string - Título del modal
- `message`: string - Mensaje descriptivo
- `confirmText`: string (opcional) - Texto del botón de confirmación (default: "Confirmar")
- `cancelText`: string (opcional) - Texto del botón de cancelar (default: "Cancelar")
- `confirmButtonClass`: string (opcional) - Clases CSS para el botón de confirmación (default: "bg-red-600 hover:bg-red-700")
- `isLoading`: boolean (opcional) - Muestra spinner y desactiva botones durante operaciones asíncronas

**Características:**
- Diseño moderno con backdrop blur
- Icono de advertencia visual
- Previene cierre accidental durante operaciones (isLoading)
- Cierre con tecla ESC (cuando no está cargando)
- Bloquea el scroll del body cuando está abierto
- Spinner animado durante operaciones asíncronas
- Completamente personalizable mediante props

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

