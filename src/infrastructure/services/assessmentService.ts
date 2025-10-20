import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

/**
 * Servicio de Assessment
 * Maneja las peticiones relacionadas con la obtención de preguntas de evaluación
 */

/**
 * Interfaz para una pregunta del assessment
 */
export interface AssessmentQuestion {
  id: string;
  text: string;
  tip: string; // Consejo dinámico para ayudar al usuario
  haveMoreQuestions: boolean; // Para áreas con preguntas condicionales (ej: Pareja e Intimidad)
  isRequired: boolean;
}

/**
 * Interfaz para el área
 */
export interface Area {
  id: string;
  name: string;
}

/**
 * Interfaz para la respuesta del endpoint de preguntas por área
 */
export interface AreaQuestionsResponse {
  questions: AssessmentQuestion[];
  totalQuestions: number;
  area: Area;
}

/**
 * Servicio de assessment
 */
export const assessmentService = {
  /**
   * Obtiene las preguntas de un área específica del Life Wheel (CON CACHÉ)
   * Endpoint: GET /assessment/area/:areaId
   *
   * @param areaId - ID del área (ej: PERSONAL_DEVELOPMENT, HEALTH_NUTRITION, etc.)
   * @returns Objeto con las preguntas del área ordenadas
   * 
   * Configuración de caché:
   * - Tipo: STATIC (desde env)
   * - TTL: VITE_CACHE_TTL_STATIC
   * - Max accesos: VITE_CACHE_MAX_ACCESS_STATIC
   *
   * @example
   * ```typescript
   * const questions = await assessmentService.getAreaQuestions(
   *   "13c6a6a4-7142-44ab-a4ca-8b28418abc3c"
   * );
   * ```
   */
  getAreaQuestions: async (areaId: string): Promise<AreaQuestionsResponse> => {
    return cacheApiCall(
      `assessment_area_${areaId}`,
      () => apiClient.get<AreaQuestionsResponse>(`/assessment/area/${areaId}`),
      apiCache,
      
    );
  },
};

