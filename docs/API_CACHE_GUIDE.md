# Guía del Sistema de Caché de API

## 📋 Descripción General

Este sistema de caché está diseñado para optimizar las llamadas a la API mediante el uso de `localStorage` con dos mecanismos de expiración:

1. **TTL (Time To Live)**: El caché expira después de un tiempo definido
2. **Contador de Accesos**: Después de N accesos al caché, se refresca desde el API

## 🎯 Configuración por Defecto

- **TTL**: 5 minutos (300,000 ms)
- **Max Accesos**: 10 accesos
- **Prefijo**: `api_cache_`

Esto significa que:
- Cada **10 accesos** al caché, la llamada 11 va al endpoint real y actualiza el caché
- Si pasan más de **5 minutos**, el caché expira automáticamente
- Lo que ocurra primero, dispara la actualización

## 🚀 Servicios con Caché Implementado

### 1. UserService

#### `userService.getMe()`
- **Clave de caché**: `user_me`
- **Usado en**: Dashboard, Profile
- **TTL**: 5 minutos
- **Max Accesos**: 10

#### `userService.updateUser()`
- **Invalida**: `user_me`
- Al actualizar el perfil, se invalida el caché para obtener datos frescos

### 2. LifeWheelService

#### `lifeWheelService.getMyLifeWheel()`
- **Clave de caché**: `lifewheel_me`
- **Usado en**: Home, Dashboard
- **TTL**: 5 minutos
- **Max Accesos**: 10

#### `lifeWheelService.addLifeWheelAreas()`
- **Invalida**: `lifewheel_me`, `user_me`
- Al agregar áreas, se invalidan cachés relacionados

### 3. ProjectService

#### `projectService.getAllProjects()`
- **Clave de caché**: `projects_all`
- **Usado en**: ProjectsPage
- **TTL**: 5 minutos
- **Max Accesos**: 10

#### `projectService.getProjectsByArea(areaId)`
- **Clave de caché**: `projects_area_{areaId}`
- **Usado en**: AreaProjectsPage
- **TTL**: 5 minutos
- **Max Accesos**: 10

#### `projectService.createFromLifeWheelArea()`
- **Invalida**: `projects_all`, `projects_area_{areaId}`, `user_me`

#### `projectService.updateStatus()`
- **Invalida**: `projects_all`, todos los `projects_area_*`, `user_me`

## 💡 Cómo Funciona

### Ejemplo Práctico

```typescript
// Primera llamada: Va al API
const data1 = await userService.getMe(); 
// Console: 🌐 Cache MISS para "user_me" - Llamando al API...
// Console: 💾 Cache SET para "user_me" (TTL: 300000ms, Max accesos: 10)

// Llamadas 2-10: Del caché
const data2 = await userService.getMe(); 
// Console: 📦 Cache HIT para "user_me" (acceso 1/10)

const data3 = await userService.getMe(); 
// Console: 📦 Cache HIT para "user_me" (acceso 2/10)

// ... (accesos 3-10 similares)

// Llamada 11: Vuelve al API (excedió max accesos)
const data11 = await userService.getMe(); 
// Console: 🌐 Cache MISS para "user_me" - Llamando al API...
```

## 🛠️ Uso Avanzado

### Personalizar Configuración

```typescript
import { cacheApiCall, ApiCache } from '@/shared/utils/apiCache';

// Crear una instancia personalizada
const customCache = new ApiCache({
  ttl: 10 * 60 * 1000, // 10 minutos
  maxAccessCount: 20,   // 20 accesos
  keyPrefix: 'custom_'  // Prefijo personalizado
});

// Usar en una función
const getCustomData = () => cacheApiCall(
  'custom_key',
  () => apiClient.get('/endpoint'),
  customCache,
  {
    ttl: 15 * 60 * 1000, // Override: 15 minutos para este específico
  }
);
```

### Invalidar Caché Manualmente

```typescript
import { apiCache } from '@/shared/utils/apiCache';

// Invalidar un item específico
apiCache.remove('user_me');

// Limpiar todo el caché
apiCache.clearAll();

// Limpiar solo items expirados
apiCache.cleanExpired();
```

### Obtener Estadísticas

```typescript
import { apiCache } from '@/shared/utils/apiCache';

const stats = apiCache.getStats('user_me');
console.log(stats);
// {
//   exists: true,
//   accessCount: 5,
//   remainingTime: 240000, // en ms
//   remainingAccesses: 5
// }
```

## 📊 Monitoreo en Consola

El sistema registra automáticamente las operaciones en la consola:

- `🌐 Cache MISS`: No hay caché válido, llamando al API
- `💾 Cache SET`: Datos guardados en caché
- `📦 Cache HIT`: Datos obtenidos del caché
- `🗑️ Cache REMOVE`: Item eliminado del caché
- `🧹 Cache limpiado`: Múltiples items eliminados
- `✅ Sistema de caché inicializado`: Caché listo

## 🔄 Estrategia de Invalidación

### Automática
- Después de N accesos (default: 10)
- Después del tiempo TTL (default: 5 minutos)

### Manual
- Cuando se actualiza/crea/elimina un recurso
- Ejemplo: Al actualizar perfil → invalida `user_me`
- Ejemplo: Al crear proyecto → invalida `projects_all`, `projects_area_{id}`, `user_me`

## ⚠️ Consideraciones

1. **localStorage tiene límite**: ~5-10 MB dependiendo del navegador
2. **No cachear datos sensibles**: Solo datos de usuario autenticado
3. **Invalidación en cascada**: Operaciones que afectan múltiples recursos invalidan múltiples cachés
4. **Prefijos separados**: 
   - `api_cache_` para datos de API
   - `pdf_cache_` para PDFs (sistema separado)

## 🔍 Debugging

```typescript
// Ver todos los items en caché
Object.keys(localStorage)
  .filter(key => key.startsWith('api_cache_'))
  .forEach(key => console.log(key, localStorage.getItem(key)));

// Ver tamaño del caché
const cacheSize = Object.keys(localStorage)
  .filter(key => key.startsWith('api_cache_'))
  .reduce((sum, key) => sum + (localStorage.getItem(key)?.length || 0), 0);
console.log(`Cache size: ${(cacheSize / 1024).toFixed(2)} KB`);
```

## 📚 Referencias

- Archivo principal: `src/shared/utils/apiCache.ts`
- Servicios implementados:
  - `src/infrastructure/services/userService.ts`
  - `src/infrastructure/services/lifeWheelService.ts`
  - `src/infrastructure/services/projectService.ts`
- Inicialización: `src/main.tsx`

## 🎨 Mejores Prácticas

1. **Siempre invalidar después de mutaciones** (POST, PUT, DELETE)
2. **Usar claves descriptivas** para el caché
3. **Configurar TTL según la volatilidad de los datos**:
   - Datos estáticos: TTL largo (30 min - 1 hora)
   - Datos dinámicos: TTL corto (2-5 min)
4. **Monitorear el tamaño del localStorage**
5. **Limpiar caché expirado periódicamente** (se hace automáticamente al iniciar)

## 🚧 Próximas Implementaciones

Para implementar caché en otros servicios:

1. Importar las utilidades:
   ```typescript
   import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';
   ```

2. Envolver la llamada al API:
   ```typescript
   getData: async () => {
     return cacheApiCall(
       'unique_cache_key',
       () => apiClient.get('/endpoint'),
       apiCache
     );
   }
   ```

3. Invalidar en mutaciones:
   ```typescript
   updateData: async (data) => {
     const result = await apiClient.put('/endpoint', data);
     apiCache.remove('unique_cache_key');
     return result;
   }
   ```

