# 🎯 Ejemplos de Uso del Sistema de Caché

## 📱 Uso Básico en Componentes

### Dashboard con Caché

El DashboardPage ya usa caché automáticamente:

```tsx
// src/features/dashboard/pages/DashboardPage.tsx
import { userService } from '@/infrastructure/services';

// Esta llamada usa caché automáticamente
const response = await userService.getMe();
```

**Resultado:**
- Primera llamada: Va al API (~500ms)
- Siguientes 10 llamadas: Del caché (~5ms) ⚡
- Llamada 11: Refresca desde el API

---

## 🔍 Panel de Debug (Solo Desarrollo)

### Opción 1: Panel Flotante Completo

Agrega el panel de debug a cualquier página para visualizar el caché en tiempo real:

```tsx
// En cualquier página durante desarrollo
import { CacheDebugPanel } from '@/shared/components';

export const DashboardPage = () => {
  return (
    <div>
      {/* Tu contenido normal */}
      
      {/* Panel de debug (solo para desarrollo) */}
      {import.meta.env.DEV && <CacheDebugPanel />}
    </div>
  );
};
```

**Características del Panel:**
- 📊 Muestra todos los cachés activos
- ⏱️ Tiempo restante antes de expirar
- 🔢 Número de accesos restantes
- 🗑️ Botón para invalidar cada caché
- 🧹 Botón para limpiar todo el caché

### Opción 2: Indicador Compacto

Si solo quieres ver si un caché está activo:

```tsx
import { CacheIndicator } from '@/shared/components';

export const MyComponent = () => {
  return (
    <div>
      <h1>Dashboard <CacheIndicator cacheKey="user_me" /></h1>
    </div>
  );
};
```

---

## 🛠️ Invalidación Manual

### En un Componente

```tsx
import { useCacheInvalidator } from '@/shared/hooks';

export const ProfileSettings = () => {
  const { invalidate } = useCacheInvalidator();

  const handleUpdate = async () => {
    // Actualizar datos...
    
    // Invalidar caché manualmente si es necesario
    invalidate('user_me');
  };

  return <button onClick={handleUpdate}>Actualizar</button>;
};
```

### Limpiar Todo el Caché

```tsx
import { useCacheInvalidator } from '@/shared/hooks';

export const SettingsPage = () => {
  const { invalidateAll } = useCacheInvalidator();

  return (
    <button onClick={invalidateAll}>
      🗑️ Limpiar Todo el Caché
    </button>
  );
};
```

---

## 🎨 Implementar Caché en un Nuevo Servicio

### Paso 1: Importar las Utilidades

```tsx
// src/infrastructure/services/miServicio.ts
import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';
```

### Paso 2: Envolver el Método GET

```tsx
export const miServicio = {
  // GET con caché
  getData: async (): Promise<MiData> => {
    return cacheApiCall(
      'mi_data_cache_key', // Clave única
      () => apiClient.get<MiData>('/mi-endpoint'),
      apiCache,
      {
        ttl: 5 * 60 * 1000, // 5 minutos (opcional)
        maxAccessCount: 10,  // 10 accesos (opcional)
      }
    );
  },
```

### Paso 3: Invalidar en Mutaciones

```tsx
  // POST/PUT/DELETE sin caché pero invalida
  updateData: async (data: MiData): Promise<MiData> => {
    const result = await apiClient.put<MiData>('/mi-endpoint', data);
    
    // Invalidar caché después de actualizar
    apiCache.remove('mi_data_cache_key');
    
    return result;
  },
};
```

---

## 📊 Monitorear el Caché

### En la Consola del Navegador

```javascript
// Ver todos los cachés activos
Object.keys(localStorage)
  .filter(key => key.startsWith('api_cache_'))
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)));
  });

// Ver tamaño del caché
const cacheSize = Object.keys(localStorage)
  .filter(key => key.startsWith('api_cache_'))
  .reduce((sum, key) => sum + (localStorage.getItem(key)?.length || 0), 0);
console.log(`Tamaño total del caché: ${(cacheSize / 1024).toFixed(2)} KB`);
```

### Usando el Hook

```tsx
import { useCacheDebug } from '@/shared/hooks';

export const CacheMonitor = () => {
  const stats = useCacheDebug('user_me');

  if (!stats?.exists) return <span>No hay caché</span>;

  return (
    <div>
      <p>Accesos: {stats.accessCount}</p>
      <p>Tiempo restante: {Math.round(stats.remainingTime / 1000)}s</p>
      <p>Accesos restantes: {stats.remainingAccesses}</p>
    </div>
  );
};
```

---

## 🎯 Casos de Uso Comunes

### 1. Dashboard que se visita frecuentemente

```tsx
// userService.getMe() con caché
// Resultado: Carga instantánea después de la primera visita
```

### 2. Lista de Proyectos

```tsx
// projectService.getAllProjects() con caché
// Resultado: Lista se carga del caché, actualiza cada 10 visitas
```

### 3. Proyectos por Área

```tsx
// projectService.getProjectsByArea(areaId) con caché
// Resultado: Cada área tiene su propio caché independiente
```

### 4. Perfil de Usuario

```tsx
// Después de actualizar el perfil
await userService.updateUser(data);
// El caché se invalida automáticamente
// La próxima visita al dashboard traerá datos frescos
```

---

## ⚡ Optimizaciones Avanzadas

### Caché con TTL Personalizado

```tsx
// Para datos que cambian poco
const getStaticData = () => cacheApiCall(
  'static_data',
  () => apiClient.get('/static-endpoint'),
  apiCache,
  {
    ttl: 60 * 60 * 1000, // 1 hora
    maxAccessCount: 50,   // 50 accesos
  }
);

// Para datos que cambian mucho
const getDynamicData = () => cacheApiCall(
  'dynamic_data',
  () => apiClient.get('/dynamic-endpoint'),
  apiCache,
  {
    ttl: 2 * 60 * 1000, // 2 minutos
    maxAccessCount: 5,   // 5 accesos
  }
);
```

### Instancia de Caché Personalizada

```tsx
import { ApiCache } from '@/shared/utils/apiCache';

// Crear una instancia separada para un feature específico
const assessmentCache = new ApiCache({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxAccessCount: 20,
  keyPrefix: 'assessment_cache_',
});

export const assessmentService = {
  getQuestions: async () => {
    return cacheApiCall(
      'questions',
      () => apiClient.get('/assessment/questions'),
      assessmentCache // Usar la instancia personalizada
    );
  },
};
```

---

## 🐛 Troubleshooting

### El caché no se está actualizando

```tsx
// Verificar que estás invalidando correctamente
apiCache.remove('cache_key');

// O ver estadísticas
const stats = apiCache.getStats('cache_key');
console.log(stats);
```

### localStorage está lleno

```javascript
// Limpiar todo el caché de la aplicación
apiCache.clearAll();

// O solo items expirados
apiCache.cleanExpired();
```

### No veo los logs en consola

Los logs se muestran automáticamente. Busca:
- `[ApiCache]` en la consola
- `🌐 Cache MISS` = Llamada al API
- `📦 Cache HIT` = Desde caché

---

## 📚 Referencias

- **Utilidad Principal**: `src/shared/utils/apiCache.ts`
- **Hooks**: `src/shared/hooks/useCacheDebug.ts`
- **Componentes**: `src/shared/components/CacheDebugPanel/`
- **Guía Completa**: `docs/API_CACHE_GUIDE.md`

