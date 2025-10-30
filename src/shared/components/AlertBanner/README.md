# AlertBanner Component

Componente reutilizable para mostrar alertas/notificaciones en la parte superior de la pantalla.

## Características

- ✅ 4 tipos de alerta: `error`, `warning`, `success`, `info`
- ✅ Auto-cierre configurable
- ✅ Animación de entrada suave (slide-down)
- ✅ Botón de cerrar opcional
- ✅ Diseño responsive
- ✅ Colores y estilos consistentes
- ✅ TypeScript completo

## Uso Básico

```tsx
import { AlertBanner } from '@/shared/components';
import { useState } from 'react';

function MyComponent() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <>
      {showAlert && (
        <AlertBanner
          type="error"
          title="Error"
          message="Something went wrong. Please try again."
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `type` | `'error' \| 'warning' \| 'success' \| 'info'` | - | **Requerido**. Tipo de alerta que determina color e ícono |
| `title` | `string` | - | **Requerido**. Título principal de la alerta |
| `message` | `string` | - | **Requerido**. Mensaje detallado |
| `onClose` | `() => void` | - | **Requerido**. Función que se ejecuta al cerrar |
| `autoCloseDuration` | `number` | `5000` | Duración en ms antes de auto-cerrar. Si es `0`, no se auto-cierra |
| `showCloseButton` | `boolean` | `true` | Si se muestra el botón de cerrar (X) |

## Ejemplos

### Error Alert
```tsx
<AlertBanner
  type="error"
  title="Cannot Complete Project"
  message="You need to complete all actions first."
  onClose={() => setErrorMessage(null)}
/>
```

### Success Alert
```tsx
<AlertBanner
  type="success"
  title="Project Created!"
  message="Your project has been created successfully."
  onClose={() => setSuccessMessage(null)}
/>
```

### Warning Alert (Sin Auto-Cierre)
```tsx
<AlertBanner
  type="warning"
  title="Pending Actions"
  message="You have 5 actions due today."
  onClose={() => setWarningMessage(null)}
  autoCloseDuration={0}
/>
```

### Info Alert (Sin Botón de Cerrar)
```tsx
<AlertBanner
  type="info"
  title="Tip"
  message="Create actions from your goals to stay on track."
  onClose={() => setInfoMessage(null)}
  showCloseButton={false}
  autoCloseDuration={3000}
/>
```

## Estilos de Alerta

| Tipo | Color | Uso Recomendado |
|------|-------|----------------|
| `error` | Rojo | Errores, validaciones fallidas, operaciones rechazadas |
| `warning` | Ámbar | Advertencias, acciones que requieren atención |
| `success` | Verde | Operaciones exitosas, confirmaciones |
| `info` | Azul | Información general, tips, notificaciones |

## Posicionamiento

El componente usa `position: fixed` y se coloca en la parte superior de la pantalla (`top: 0`). Tiene un `z-index` de 50 para asegurar que aparezca sobre otros elementos.

## Animación

El componente incluye la animación `animate-slide-down` definida en `src/styles/main.css`:

```css
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Accesibilidad

- El botón de cerrar incluye `aria-label="Close alert"` para lectores de pantalla
- Los colores tienen suficiente contraste para cumplir con WCAG AA
- Los íconos son descriptivos y complementan el mensaje de texto

