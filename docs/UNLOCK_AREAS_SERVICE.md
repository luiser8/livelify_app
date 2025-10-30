# Servicio de Desbloqueo de Áreas del Life Wheel

## 📋 Descripción

Servicio para desbloquear áreas del Life Wheel que están bloqueadas (`isBlocked: true`).

## 🔧 Endpoint

```
POST /lifewheel/unlock-areas
```

## 📦 Interfaces TypeScript

### Request

```typescript
export interface UnlockAreasRequest {
  lifeWheelAreaIds: string[];
}
```

### Response

```typescript
export interface UnlockAreasResponse {
  success: boolean;
  message?: string;
  unlockedAreas?: Array<{
    id: string;
    isBlocked: boolean;
  }>;
}
```

## 💻 Ejemplo de Uso

### Importar el servicio

```typescript
import { lifeWheelService } from '@/infrastructure/services';
```

### Desbloquear áreas

```typescript
const unlockAreas = async () => {
  try {
    const response = await lifeWheelService.unlockAreas({
      lifeWheelAreaIds: [
        "123e4567-e89b-12d3-a456-426614174000",
        "123e4567-e89b-12d3-a456-426614174001",
        "123e4567-e89b-12d3-a456-426614174002"
      ]
    });

    if (response.success) {
      console.log('Áreas desbloqueadas exitosamente:', response.unlockedAreas);
      // El caché se invalida automáticamente
      // Puedes recargar los datos del Life Wheel
    } else {
      console.error('Error al desbloquear áreas:', response.message);
    }
  } catch (error) {
    console.error('Error en la petición:', error);
  }
};
```

### Ejemplo en un componente React

```typescript
import { useState } from 'react';
import { lifeWheelService } from '@/infrastructure/services';

export const UnlockAreasButton = ({ areaIds }: { areaIds: string[] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await lifeWheelService.unlockAreas({
        lifeWheelAreaIds: areaIds
      });

      if (response.success) {
        // Recargar datos del Life Wheel
        window.location.reload(); // O usar un método más elegante
      } else {
        setError(response.message || 'Error al desbloquear áreas');
      }
    } catch (err) {
      setError('Error en la petición');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleUnlock}
        disabled={loading || areaIds.length === 0}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Desbloqueando...' : 'Desbloquear Áreas'}
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};
```

## ⚠️ Consideraciones Importantes

1. **Invalidación de Caché**: El servicio automáticamente invalida el caché de:
   - `lifewheel_me`
   - `user_me`

2. **Permisos**: Requiere autenticación (Bearer token en header)

3. **IDs Válidos**: Los IDs deben corresponder a áreas existentes del usuario

4. **Estado de Bloqueo**: Solo puede desbloquear áreas que estén bloqueadas (`isBlocked: true`)

## 🔄 Flujo Completo

1. Usuario selecciona áreas a desbloquear
2. Se llama a `lifeWheelService.unlockAreas({ lifeWheelAreaIds: [...] })`
3. El backend procesa la petición y actualiza `isBlocked: false`
4. El caché se invalida automáticamente
5. La aplicación recarga los datos del Life Wheel
6. Las áreas ahora aparecen desbloqueadas en la UI

## 📝 Notas

- Las áreas desbloqueadas vuelven a estar disponibles para crear proyectos
- El sistema de selección de áreas considera `isBlocked` para determinar áreas válidas
- Ver `getSelectableAreas()` en `lifeWheelHelpers.ts` para más detalles

