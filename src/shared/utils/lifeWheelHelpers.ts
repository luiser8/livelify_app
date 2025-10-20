/**
 * Helper functions for Life Wheel area management
 */

export interface LifeArea {
  id: string;
  areaId: string;
  areaName: string;
  score: number;
  isArchived: boolean;
}

/**
 * Obtiene las áreas más bajas dinámicamente según sus puntuaciones.
 * 
 * Lógica inteligente corregida:
 * 1. PRIORIDAD EN LOS MENORES SIEMPRE
 * 2. Ordena todas las áreas de menor a mayor puntuación
 * 3. Agrupa por puntuación y selecciona las 3 áreas con menor puntuación
 * 4. Solo pregunta al usuario cuando hay MÁS de 3 áreas con empate en puntuaciones bajas
 * 
 * Ejemplos:
 * - 3 áreas con 5/10 y 1 con 9/10 → Auto-selecciona las 3 de 5/10 (NO pregunta)
 * - 4 áreas con 5/10 → Pregunta porque hay empate de 4 áreas en el score más bajo
 * - 2 áreas con 7/10 y 2 con 8/10 → Pregunta porque necesitamos 3 y hay empate
 * 
 * @param lifeAreas - Array de áreas de vida evaluadas
 * @returns Set con los IDs de las áreas seleccionables y metadata
 */
export const getSelectableAreas = (lifeAreas: LifeArea[]) => {
  // Filtrar solo áreas evaluadas (isArchived) y no perfectas
  const evaluatedAreas = lifeAreas.filter(area => area.isArchived && area.score < 10);
  
  if (evaluatedAreas.length === 0) {
    return {
      selectableAreaIds: new Set<string>(),
      count: 0,
      lowestScore: 0,
      hasMultipleTied: false,
      requiresUserSelection: false
    };
  }

  // Ordenar áreas por puntuación ascendente (menor a mayor)
  const sortedAreas = [...evaluatedAreas].sort((a, b) => a.score - b.score);

  const lowestScore = sortedAreas[0].score;
  
  // Estrategia CORREGIDA: Priorizar SIEMPRE las puntuaciones más bajas
  // 1. Agrupar áreas por puntuación
  const areasByScore = new Map<number, LifeArea[]>();
  for (const area of sortedAreas) {
    if (!areasByScore.has(area.score)) {
      areasByScore.set(area.score, []);
    }
    areasByScore.get(area.score)!.push(area);
  }
  
  // 2. Obtener puntuaciones únicas ordenadas de menor a mayor
  const uniqueScores = Array.from(areasByScore.keys()).sort((a, b) => a - b);
  
  // 3. Seleccionar áreas empezando por la puntuación más baja
  const autoSelectedAreas: LifeArea[] = []; // Áreas que se auto-seleccionan (prioridad)
  const candidateAreas: LifeArea[] = []; // Áreas entre las que el usuario debe elegir
  let selectedCount = 0;
  
  for (const score of uniqueScores) {
    const areasWithThisScore = areasByScore.get(score)!;
    const remainingSlots = 3 - selectedCount;
    
    if (remainingSlots <= 0) break; // Ya tenemos 3
    
    // Si con este score completamos o superamos 3, agregamos estas áreas
    if (areasWithThisScore.length <= remainingSlots) {
      // Todas las áreas de este score caben automáticamente
      autoSelectedAreas.push(...areasWithThisScore);
      selectedCount += areasWithThisScore.length;
    } else {
      // Hay más áreas de las que necesitamos → EMPATE, usuario debe elegir
      candidateAreas.push(...areasWithThisScore);
      break; // Salir porque hay empate
    }
  }

  // Decidir si necesita selección del usuario
  const requiresUserSelection = candidateAreas.length > 0;
  
  // Si no necesita selección, usar solo las auto-seleccionadas
  // Si necesita selección, combinar auto-seleccionadas + candidatas
  const finalSelectedAreas = requiresUserSelection 
    ? autoSelectedAreas // Solo las que YA están confirmadas
    : autoSelectedAreas.slice(0, 3);

  const remainingSlotsForUser = 3 - autoSelectedAreas.length;

  return {
    selectableAreaIds: new Set(finalSelectedAreas.map(area => area.id)),
    count: finalSelectedAreas.length,
    lowestScore,
    hasMultipleTied: candidateAreas.length > 0,
    requiresUserSelection,
    autoSelectedAreas: autoSelectedAreas.map(a => ({ 
      id: a.id, 
      areaName: a.areaName, 
      score: a.score 
    })),
    candidateAreas: requiresUserSelection ? candidateAreas.map(a => ({ 
      id: a.id, 
      areaName: a.areaName, 
      score: a.score 
    })) : undefined,
    remainingSlotsForUser // Cuántas áreas más debe elegir el usuario
  };
};

/**
 * Función para que el usuario seleccione 3 áreas específicas de las candidatas
 * @param selectedAreaIds - Los IDs de las 3 áreas que el usuario eligió
 * @param candidateAreas - Todas las áreas candidatas disponibles
 * @returns Set con los IDs finales seleccionados
 */
export const userSelectAreas = (selectedAreaIds: string[], candidateAreas: LifeArea[] | undefined): Set<string> => {
  if (selectedAreaIds.length !== 3) {
    throw new Error('El usuario debe seleccionar exactamente 3 áreas');
  }
  
  // Validar que los IDs seleccionados estén entre las áreas candidatas
  const validIds = new Set(candidateAreas?.map(area => area.id));
  const invalidIds = selectedAreaIds.filter(id => !validIds.has(id));
  
  if (invalidIds.length > 0) {
    throw new Error(`Algunos IDs seleccionados no son válidos: ${invalidIds.join(', ')}`);
  }

  return new Set(selectedAreaIds);
};