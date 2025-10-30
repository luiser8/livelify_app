# Corrección: Límite de Proyectos por Área y Bloqueo por Objetivo Cumplido

## Problema Reportado

En la vista de creación de proyectos (`/projects/create`), existían varios problemas relacionados con el límite de 2 proyectos por área y bloqueo de áreas:

1. **Conteo incorrecto**: Solo se contaban proyectos con status "ACTIVE", no todos los proyectos del área
2. **Áreas disponibles incorrectamente**: Las áreas con 2 proyectos completados volvían a aparecer como disponibles
3. **Lógica de bloqueo incorrecta**: No se bloqueaban áreas que ya tenían 2 proyectos (independientemente de su status)
4. **Falta de visibilidad**: No se mostraba el conteo de proyectos totales en todas las áreas evaluadas
5. **Áreas con objetivo cumplido**: Áreas con 10/10 seguían disponibles para crear proyectos (sin sentido práctico)

## Solución Implementada

### Cambios en `CreateProjectPage.tsx`

#### 1. Conteo de Proyectos (líneas 52-67)
**Antes:**
```typescript
// Contar proyectos ACTIVOS por área
allProjectsData.projects.forEach(project => {
  if (project.status === 'ACTIVE') {
    const currentCount = countMap.get(project.lifeWheelAreaId) || 0;
    countMap.set(project.lifeWheelAreaId, currentCount + 1);
  }
});
```

**Después:**
```typescript
// Contar TODOS los proyectos por área (sin importar el status)
// Esto incluye ACTIVE, SOMEDAY, COMPLETED, CANCELLED
allProjectsData.projects.forEach(project => {
  const currentCount = countMap.get(project.lifeWheelAreaId) || 0;
  countMap.set(project.lifeWheelAreaId, currentCount + 1);
});
```

#### 2. Validación al Entrar con `areaId` en URL (líneas 138-147)
**Antes:**
```typescript
const projectsData = await projectService.getProjectsByArea(urlAreaId);
const activeProjects = projectsData.projects.filter(p => p.status === 'ACTIVE');

// Si ya tiene 2 proyectos activos, redirigir
if (activeProjects.length >= 2) {
  navigate(`/area/${urlAreaId}/projects`);
  return;
}
```

**Después:**
```typescript
const projectsData = await projectService.getProjectsByArea(urlAreaId);
// Contar TODOS los proyectos, no solo activos
const totalProjects = projectsData.projects.length;

// Si ya tiene 2 proyectos en total, redirigir
if (totalProjects >= 2) {
  navigate(`/area/${urlAreaId}/projects`);
  return;
}
```

#### 3. Validación en `handleSelectArea` (líneas 232-249)
**Antes:**
```typescript
// Verificar que el área no tenga ya 2 proyectos activos
const activeProjectsCount = projectCountByArea.get(areaId) || 0;
if (activeProjectsCount >= 2) {
  // Redirigir al área si ya tiene 2 proyectos activos
  navigate(`/area/${areaId}/projects`);
  return;
}
```

**Después:**
```typescript
// Verificar que el área no tenga ya 2 proyectos en total (sin importar status)
const totalProjectsCount = projectCountByArea.get(areaId) || 0;
if (totalProjectsCount >= 2) {
  // Redirigir al área si ya tiene 2 proyectos en total
  navigate(`/area/${areaId}/projects`);
  return;
}
```

#### 4. Visualización en Grid de Áreas (líneas 416-507)
**Cambios principales:**
- Variable `activeProjectsCount` → `totalProjectsCount`
- Ahora se muestra el contador en **todas las áreas evaluadas**, no solo en las habilitadas
- El badge muestra el conteo total: "X/2 proyectos"

**Antes:**
```typescript
const activeProjectsCount = projectCountByArea.get(area.id) || 0;
const hasReachedLimit = activeProjectsCount >= 2;

// ...

{/* Mostrar contador de proyectos activos - siempre en áreas habilitadas */}
{isEnabled && (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
    hasReachedLimit 
      ? 'bg-red-100 text-red-700' 
      : activeProjectsCount > 0
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600'
  }`}>
    {activeProjectsCount}/2 {t('projects.create.projects')}
  </span>
)}
```

**Después:**
```typescript
const totalProjectsCount = projectCountByArea.get(area.id) || 0;
const hasReachedLimit = totalProjectsCount >= 2;

// ...

{/* Mostrar contador de proyectos totales - siempre visible en áreas evaluadas */}
{isEvaluated && (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
    hasReachedLimit 
      ? 'bg-red-100 text-red-700' 
      : totalProjectsCount > 0
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-600'
  }`}>
    {totalProjectsCount}/2 {t('projects.create.projects')}
  </span>
)}
```

#### 5. Validación Antes de Crear Proyecto (líneas 315-325)
**Antes:**
```typescript
const projectsData = await projectService.getProjectsByArea(selectedAreaId);
const activeProjects = projectsData.projects.filter(p => p.status === 'ACTIVE');

if (activeProjects.length >= 2) {
  // Si ya tiene 2 proyectos activos, redirigir
  navigate(`/area/${selectedAreaId}/projects`);
  return;
}
```

**Después:**
```typescript
const projectsData = await projectService.getProjectsByArea(selectedAreaId);
const totalProjects = projectsData.projects.length;

if (totalProjects >= 2) {
  // Si ya tiene 2 proyectos en total, redirigir
  navigate(`/area/${selectedAreaId}/projects`);
  return;
}
```

## Reglas de Negocio Implementadas

### Límite de Proyectos por Área
- **Máximo**: 2 proyectos por área de vida
- **Conteo**: Se cuentan TODOS los proyectos, sin importar su status:
  - `ACTIVE` (Activo)
  - `SOMEDAY` (Algún día)
  - `COMPLETED` (Completado)
  - `CANCELLED` (Cancelado)

### Bloqueo por Objetivo Cumplido
- **Nueva regla**: Las áreas con puntuación de **10/10 se bloquean automáticamente**
- **Razón**: Si el área ya alcanzó el objetivo máximo, no tiene sentido crear más proyectos
- **Mensaje**: "✅ Objetivo Alcanzado - 10/10" (badge verde)
- **Comportamiento**: Incluso si tiene 0 o 1 proyecto, si tiene 10/10 no se pueden crear más proyectos

### Comportamiento de Bloqueo
Un área se bloquea para crear nuevos proyectos cuando cumple **cualquiera** de estas condiciones:
1. Ya tiene **2 proyectos** (sin importar el status), **O**
2. Ya alcanzó **10/10 de puntuación** (objetivo cumplido), **O**
3. No está dentro de las **3 áreas seleccionables** (las de menor puntuación o seleccionadas por el usuario)

### Visualización del Contador
- **Áreas evaluadas**: Muestran el contador "X/2 proyectos"
  - Badge gris: 0 proyectos (`bg-gray-100 text-gray-600`)
  - Badge azul: 1 proyecto (`bg-blue-100 text-blue-700`)
  - Badge rojo: 2 proyectos - límite alcanzado (`bg-red-100 text-red-700`)
- **Áreas no evaluadas**: No muestran contador (aún no se puede crear proyectos)

### Mensajes de Estado
- **Área habilitada**: "+X potencial" (puntos que puede ganar)
- **Objetivo cumplido**: "✅ Objetivo Alcanzado - 10/10" (área bloqueada por tener puntuación máxima)
- **Límite alcanzado**: "🔒 Máximo Alcanzado - 2/2 proyectos" (área bloqueada por tener 2 proyectos)
- **Área bloqueada**: "🔒 Bloqueado - Enfócate en áreas con menor puntuación"
- **Evaluación requerida**: "ⓘ Evaluación Requerida"

## Casos de Uso Cubiertos

### Caso 1: Área con 2 proyectos completados
**Antes**: El área volvía a aparecer como disponible
**Ahora**: El área aparece bloqueada con "🔒 Máximo Alcanzado - 2/2 proyectos"

### Caso 2: Área con 1 proyecto activo + 1 completado
**Antes**: El área aparecía disponible (solo contaba el activo: 1/2)
**Ahora**: El área aparece bloqueada (cuenta ambos: 2/2)

### Caso 3: Área con proyectos en diferentes estados
**Antes**: Solo contaba los ACTIVE
**Ahora**: Cuenta todos los proyectos sin importar su status

### Caso 4: Usuario intenta crear proyecto en área con límite alcanzado
**Antes**: Permitía continuar hasta validación final
**Ahora**: Redirige inmediatamente a la página del área

### Caso 5: Área alcanza 10/10 con solo 1 proyecto ⭐ NUEVO
**Antes**: Permitía crear un segundo proyecto (sin sentido)
**Ahora**: El área se bloquea automáticamente mostrando "✅ Objetivo Alcanzado - 10/10"

### Caso 6: Usuario completa un proyecto y el área llega a 10/10 ⭐ NUEVO
**Antes**: El área quedaba disponible para crear más proyectos
**Ahora**: El área se bloquea porque ya alcanzó el objetivo máximo

## Testing Recomendado

1. **Verificar conteo correcto**:
   - Crear 2 proyectos en un área y completarlos
   - Verificar que el área muestre "2/2 proyectos" y esté bloqueada

2. **Verificar diferentes status**:
   - Crear proyectos con diferentes status (ACTIVE, SOMEDAY, COMPLETED, CANCELLED)
   - Verificar que todos se cuenten en el límite de 2

3. **Verificar bloqueo por puntuación máxima** ⭐ NUEVO:
   - Crear 1 proyecto en un área con puntuación baja (ej: 5/10)
   - Completar el proyecto y que el área alcance 10/10
   - Verificar que el área muestre "✅ Objetivo Alcanzado - 10/10" y esté bloqueada
   - Intentar crear otro proyecto en esa área y verificar que no sea posible

4. **Verificar área con 10/10 desde el inicio** ⭐ NUEVO:
   - Evaluar un área con puntuación de 10/10
   - Verificar que no aparezca en las áreas disponibles para crear proyectos
   - Verificar mensaje "✅ Objetivo Alcanzado - 10/10"

5. **Verificar redirección**:
   - Intentar acceder a `/projects/create/:areaId` con un área que ya tiene 2 proyectos
   - Verificar que redirija a `/area/:areaId/projects`
   - Intentar acceder con un área que tiene 10/10
   - Verificar que también redirija a `/area/:areaId/projects`

6. **Verificar visualización**:
   - Navegar a `/projects/create`
   - Verificar que todas las áreas evaluadas muestren su contador "X/2 proyectos"
   - Verificar colores de badges según la cantidad de proyectos y puntuación
   - Verificar que áreas con 10/10 muestren badge verde con "✅ Objetivo Alcanzado - 10/10"

## Archivos Modificados

- `src/features/project/pages/CreateProjectPage.tsx`: Corrección de lógica de conteo, bloqueo por límite y bloqueo por puntuación máxima
- `src/i18n/locales/en.json`: Agregada traducción `projects.create.goalAchieved`
- `src/i18n/locales/es.json`: Agregada traducción `projects.create.goalAchieved`

## Lógica Detallada de los Cambios

### 1. Validación de Área con Puntuación Máxima (10/10)

#### En `handleSelectArea` (líneas 232-257)
```typescript
// Verificar que el área no haya alcanzado el puntaje máximo de 10/10
const selectedArea = lifeAreas.find(a => a.id === areaId);
if (selectedArea && selectedArea.score >= 10) {
  // Si ya tiene 10/10, redirigir al área (objetivo cumplido)
  navigate(`/area/${areaId}/projects`);
  return;
}
```

#### En validación de URL con `areaId` (líneas 138-156)
```typescript
// Si el área ya alcanzó 10/10, redirigir (objetivo cumplido)
if (selectedArea.score >= 10) {
  navigate(`/area/${urlAreaId}/projects`);
  return;
}
```

#### En validación antes de crear proyecto (líneas 328-347)
```typescript
// Verificar que el área no haya alcanzado 10/10 (doble validación)
const areaToValidate = lifeAreas.find(a => a.id === selectedAreaId);
if (areaToValidate && areaToValidate.score >= 10) {
  // Si ya tiene 10/10, redirigir (objetivo cumplido)
  navigate(`/area/${selectedAreaId}/projects`);
  return;
}
```

### 2. Actualización en el Grid de Áreas (líneas 431-438)
```typescript
const hasMaxScore = area.score >= 10; // Ya alcanzó el objetivo de 10/10
const isEnabled = enabledAreaIds.has(area.id) && !hasReachedLimit && !hasMaxScore;
const isLocked = isEvaluated && (!enabledAreaIds.has(area.id) || hasReachedLimit || hasMaxScore);
```

### 3. Orden de Prioridad en los Mensajes (líneas 498-520)
```typescript
{isEnabled ? (
  <span>+{potentialPoints} potencial</span>
) : hasMaxScore ? (
  <span>✅ Objetivo Alcanzado - 10/10</span>  // 🆕 Mensaje de éxito
) : hasReachedLimit ? (
  <span>🔒 Máximo Alcanzado - 2/2 proyectos</span>
) : isLocked ? (
  <span>🔒 Bloqueado</span>
) : (
  <span>ⓘ Evaluación Requerida</span>
)}
```

**Nota sobre la prioridad**: El mensaje "Objetivo Alcanzado" tiene prioridad sobre "Máximo Alcanzado" porque es un estado de **éxito** (el usuario cumplió su meta), mientras que el límite de proyectos es una **restricción técnica**.

## Diferencias Clave: Score 10/10 vs Límite de 2 Proyectos

| Aspecto | Score 10/10 | Límite 2 Proyectos |
|---------|------------|-------------------|
| **Tipo** | Lógica de negocio (objetivo cumplido) | Restricción técnica |
| **Badge** | Verde (✅) - mensaje positivo | Rojo (🔒) - mensaje restrictivo |
| **Mensaje** | "Objetivo Alcanzado - 10/10" | "Máximo Alcanzado - 2/2 proyectos" |
| **Número de proyectos** | Puede ser 0, 1 o 2 | Siempre es 2 |
| **Significado** | ¡Éxito! Ya no necesitas mejorar esta área | Límite técnico alcanzado |
| **Prioridad visual** | Mayor (se muestra primero) | Menor (se muestra después) |

## Notas Adicionales

- La lógica de las 3 áreas seleccionables (menor puntuación) no se modificó
- Los mensajes de traducción existentes (`projects.create.*`) se mantuvieron
- No se requieren cambios en el backend
- No se modificaron los servicios API
- El comportamiento es consistente con la página `AreaProjectsPage.tsx` que ya implementaba límite de 2 proyectos por área

## Fecha de Implementación
30 de octubre de 2025

