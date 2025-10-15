/**
 * Helper functions for Life Wheel area management
 */

export interface LifeArea {
  id: string;
  areaId: string;
  areaName: string;
  score: number;
}

/**
 * Obtiene las áreas más bajas dinámicamente según sus puntuaciones.
 * 
 * Lógica inteligente mejorada:
 * 1. Ordena todas las áreas de menor a mayor puntuación
 * 2. Identifica las áreas candidatas (las más bajas)
 * 3. Si hay más de 3 áreas candidatas debido a empates, el usuario DEBE ELEGIR 3
 * 4. Si hay exactamente 3 o menos, se seleccionan automáticamente
 * 
 * @param lifeAreas - Array de áreas de vida evaluadas
 * @returns Set con los IDs de las áreas seleccionables y metadata
 */
export const getSelectableAreas = (lifeAreas: LifeArea[]) => {
  // Filtrar solo áreas evaluadas y no perfectas
  const evaluatedAreas = lifeAreas.filter(area => area.score > 0 && area.score < 10);
  
  if (evaluatedAreas.length === 0) {
    return {
      selectableAreaIds: new Set<string>(),
      count: 0,
      lowestScore: 0,
      hasMultipleTied: false,
      requiresUserSelection: false
    };
  }

  // Ordenar áreas por puntuación ascendente
  const sortedAreas = [...evaluatedAreas].sort((a, b) => a.score - b.score);

  const lowestScore = sortedAreas[0].score;
  
  // Estrategia: Tomar áreas hasta completar 3 posiciones únicas
  // Solo pedir selección si hay empates que nos dan MÁS de 3 áreas
  
  const candidateAreas: LifeArea[] = [];
  const uniqueScores: number[] = [];
  
  for (let i = 0; i < sortedAreas.length; i++) {
    const currentArea = sortedAreas[i];
    const currentScore = currentArea.score;
    
    // Si es un score nuevo, agregarlo a uniqueScores
    if (!uniqueScores.includes(currentScore)) {
      uniqueScores.push(currentScore);
    }
    
    // Si ya tenemos 3 scores únicos Y este área tiene un score nuevo, detener
    if (uniqueScores.length > 3 && !uniqueScores.slice(0, 3).includes(currentScore)) {
      break;
    }
    
    candidateAreas.push(currentArea);
  }

  // Decidir si necesita selección del usuario
  const requiresUserSelection = candidateAreas.length > 3;
  
  // Si no necesita selección, tomar las primeras 3
  const finalSelectedAreas = requiresUserSelection 
    ? candidateAreas // Todas las candidatas para que usuario elija
    : candidateAreas.slice(0, 3);

  return {
    selectableAreaIds: new Set(finalSelectedAreas.map(area => area.id)),
    count: finalSelectedAreas.length,
    lowestScore,
    hasMultipleTied: candidateAreas.length > 3,
    requiresUserSelection,
    candidateAreas: requiresUserSelection ? candidateAreas.map(a => ({ 
      id: a.id, 
      areaName: a.areaName, 
      score: a.score 
    })) : undefined
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