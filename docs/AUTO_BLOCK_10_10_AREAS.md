# Auto-Bloqueo de Áreas con 10/10

## Descripción

Implementación de auto-bloqueo automático de áreas cuando alcanzan la puntuación máxima de **10/10** después de completar proyectos.

## Problema Original

Cuando un usuario completaba un proyecto y el área alcanzaba **10/10**, el área seguía apareciendo como "habilitada" visualmente y permitía intentar acceder a ella, aunque ya no tuviera sentido crear más proyectos.

## Solución Implementada

### 1. Detección Automática de Cambios en Scores (HomePage.tsx)

Se agregó lógica en el `useEffect` principal para:

1. **Guardar scores iniciales** en localStorage cuando se desbloquean áreas por primera vez
2. **Comparar scores** cada vez que se actualiza el `lifeWheel`
3. **Detectar áreas que alcanzaron 10/10** (que antes tenían menos de 10)
4. **Enviar POST a `/unlock-areas`** para bloquear esas áreas automáticamente

### 2. Código Implementado

#### Guardar Scores Iniciales (líneas 249-265)

```typescript
// Guardar scores actuales para comparación futura
const currentScores: Record<string, number> = {};
lifeWheel.lifeAreas.forEach(area => {
  currentScores[area.id] = area.score;
});

localStorage.setItem(
  'userAreaSelection',
  JSON.stringify({
    areaIds: areaIdsToUnlock,
    areaIdsWithAreaId,
    scores: currentScores, // 🆕 Guardar scores iniciales
    timestamp: new Date().toISOString(),
    lifeWheelId: lifeWheel.id,
    isAnswered: true
  })
);
```

#### Detección de Áreas con 10/10 (líneas 270-336)

```typescript
// 🆕 NUEVA VALIDACIÓN: Detectar áreas que alcanzaron 10/10 y bloquearlas automáticamente
if (storedSelection && alreadyUnlocked) {
  try {
    const parsed = JSON.parse(storedSelection);
    const previousScores = parsed.scores || {};
    
    // Detectar áreas que alcanzaron 10/10
    const areasReachedMaxScore = lifeWheel.lifeAreas.filter(area => {
      const previousScore = previousScores[area.id];
      const currentScore = area.score;
      
      // Si antes tenía menos de 10 y ahora tiene 10 o más
      return previousScore !== undefined && previousScore < 10 && currentScore >= 10;
    });

    if (areasReachedMaxScore.length > 0) {
      console.log('🎯 Áreas que alcanzaron 10/10:', areasReachedMaxScore.map(a => a.areaName));
      
      // Obtener IDs de las áreas que alcanzaron 10/10 para bloquearlas
      const areaIdsToBlock = areasReachedMaxScore.map(area => area.id);
      
      console.log('🔒 Enviando POST /unlock-areas para bloquear áreas con 10/10:', areaIdsToBlock);
      
      // Obtener las áreas actualmente bloqueadas del localStorage
      const currentBlockedAreas = lifeWheel.lifeAreas
        .filter(area => !parsed.areaIds.includes(area.id))
        .map(area => area.id);
      
      // Combinar con las nuevas áreas a bloquear (sin duplicados)
      const allBlockedAreas = [...new Set([...currentBlockedAreas, ...areaIdsToBlock])];
      
      // Enviar al backend las áreas que deben permanecer bloqueadas
      lifeWheelService.unlockAreas({
        lifeWheelAreaIds: allBlockedAreas
      })
        .then(() => {
          console.log('✅ Áreas con 10/10 bloqueadas automáticamente');
          
          // Actualizar enabledAreaIds removiendo las áreas con 10/10
          const updatedEnabledAreas = Array.from(newEnabledAreas).filter(
            id => !areaIdsToBlock.includes(id)
          );
          setEnabledAreaIds(new Set(updatedEnabledAreas));
        })
        .catch((error) => {
          console.error('⚠️ Error al bloquear áreas con 10/10:', error);
        });
    }
    
    // Actualizar scores en localStorage para la próxima comparación
    const currentScores: Record<string, number> = {};
    lifeWheel.lifeAreas.forEach(area => {
      currentScores[area.id] = area.score;
    });
    
    localStorage.setItem(
      'userAreaSelection',
      JSON.stringify({
        ...parsed,
        scores: currentScores,
        timestamp: new Date().toISOString()
      })
    );
  } catch (e) {
    console.error('Error parsing localStorage for score comparison:', e);
  }
}
```

## Flujo de Funcionamiento

### Escenario: Usuario completa un proyecto

1. **Estado Inicial**:
   - Área "Salud" tiene score 8/10
   - Área está en `enabledAreaIds` (puede crear proyectos)
   - localStorage tiene: `{ scores: { "area-123": 8 } }`

2. **Usuario completa proyecto**:
   - Backend actualiza score a 10/10
   - HomePage se actualiza con nuevo `lifeWheel`

3. **Detección Automática**:
   ```javascript
   // Se compara:
   previousScore = 8  // desde localStorage
   currentScore = 10  // desde lifeWheel
   
   // Se detecta: 8 < 10 && 10 >= 10 → TRUE
   // ¡Área alcanzó 10/10!
   ```

4. **Bloqueo Automático**:
   - Se obtienen áreas actualmente bloqueadas: `["area-456", "area-789"]`
   - Se agrega el área nueva: `["area-456", "area-789", "area-123"]`
   - Se envía POST: `{ lifeWheelAreaIds: ["area-456", "area-789", "area-123"] }`

5. **Actualización UI**:
   - Se remueve área de `enabledAreaIds`
   - Se actualiza localStorage con nuevo score
   - UI muestra el área con badge ✅ y estilo "bloqueado"

## Estructura localStorage

### Antes (sin scores)
```json
{
  "areaIds": ["area-1", "area-2", "area-3"],
  "areaIdsWithAreaId": ["areaId-1", "areaId-2", "areaId-3"],
  "timestamp": "2025-10-30T...",
  "lifeWheelId": "wheel-123",
  "isAnswered": true
}
```

### Ahora (con scores)
```json
{
  "areaIds": ["area-1", "area-2", "area-3"],
  "areaIdsWithAreaId": ["areaId-1", "areaId-2", "areaId-3"],
  "scores": {
    "area-1": 5,
    "area-2": 6,
    "area-3": 8,
    "area-4": 9,
    "area-5": 7,
    "area-6": 10
  },
  "timestamp": "2025-10-30T...",
  "lifeWheelId": "wheel-123",
  "isAnswered": true
}
```

## Validaciones Mantenidas

La nueva funcionalidad **NO modifica** las validaciones existentes:

✅ Validación en `handleAreaClick` (líneas 54-73)
✅ Validación en `calculateEnabledAreas` (línea 80: `area.score < 10`)
✅ Validación visual en grid de áreas (línea 577: `!hasMaxScore`)
✅ Validación en CreateProjectPage (todas las validaciones de 10/10)

## Logs de Debug

La implementación incluye logs detallados:

```javascript
console.log('🎯 Áreas que alcanzaron 10/10:', [...])
console.log('🔒 Enviando POST /unlock-areas para bloquear áreas con 10/10:', [...])
console.log('✅ Áreas con 10/10 bloqueadas automáticamente')
```

## Testing Recomendado

### Test 1: Área alcanza 10/10 con 1 proyecto
1. Crear 1 proyecto en área con score 5/10
2. Completar proyecto que sube el área a 10/10
3. Verificar:
   - ✅ Se envía POST a `/unlock-areas`
   - ✅ Área se muestra como bloqueada en HomePage
   - ✅ No se puede hacer clic en el área
   - ✅ localStorage se actualiza con nuevo score

### Test 2: Múltiples áreas alcanzan 10/10
1. Completar proyectos en 2 áreas diferentes que alcanzan 10/10
2. Verificar:
   - ✅ Se envía POST con ambas áreas
   - ✅ Ambas áreas se bloquean
   - ✅ localStorage tiene scores actualizados

### Test 3: Área ya tenía 10/10
1. Navegar a HomePage con área que ya tiene 10/10
2. Verificar:
   - ✅ NO se envía POST (ya estaba en 10/10)
   - ✅ Área se muestra correctamente bloqueada
   - ✅ localStorage mantiene score de 10

## Compatibilidad

### Usuarios Existentes
Los usuarios que ya tienen `localStorage` sin el campo `scores` no se verán afectados:
- Primera carga: No se detectan cambios (no hay `previousScores`)
- Segunda carga: Se guardan scores actuales
- Tercera carga en adelante: Sistema funciona normalmente

### Usuarios Nuevos
Los usuarios nuevos tendrán `scores` desde el principio:
- Al completar assessment: Se guardan scores
- Al seleccionar áreas manualmente: Se guardan scores
- Sistema funciona desde el primer proyecto completado

## Archivos Modificados

- `src/features/home/pages/HomePage.tsx`: Implementación principal

## Fecha de Implementación
30 de octubre de 2025

## Notas Adicionales

- El sistema es **reactivo**: Se actualiza cada vez que `lifeWheel` cambia
- Es **eficiente**: Solo compara scores cuando ya hay localStorage
- Es **robusto**: Incluye manejo de errores con try-catch
- Es **debuggeable**: Incluye logs detallados en consola

