import { apiClient } from '../api/client';
import { apiCache } from '@/shared/utils/apiCache';

/**
 * Servicio de Answers (Respuestas)
 * Maneja las peticiones relacionadas con el envío de respuestas del assessment
 */

/**
 * Interfaz para una respuesta individual
 */
export interface Answer {
  questionId: string;
  value: boolean;
}

/**
 * Interfaz para el request de envío de respuestas de un área
 */
export interface SubmitAreaAnswersRequest {
  areaId: string;
  answers: Answer[];
}

/**
 * Interfaz para la respuesta del servidor después de enviar las respuestas
 */
export interface SubmitAreaAnswersResponse {
  success: boolean;
  areaScore?: number;
  globalScore?: number;
  message?: string;
}

/**
 * Servicio de respuestas del assessment
 */
export const answerService = {
  /**
   * Envía las respuestas de las preguntas de un área específica
   * Endpoint: POST /answers/submit-area
   * 
   * NOTA: Invalida cachés relacionados con el lifeWheel y usuario
   *
   * @param data - Objeto con el areaId y array de respuestas
   * @returns Respuesta con el resultado del envío
   *
   * @example
   * ```typescript
   * const result = await answerService.submitAreaAnswers({
   *   areaId: "13c6a6a4-7142-44ab-a4ca-8b28418abc3c",
   *   answers: [
   *     { questionId: "9f3e7d7a-91bf-4fed-b992-e56c9d25faab", value: true },
   *     { questionId: "2fe3b23f-92ef-435f-ba10-cdca633ff5b7", value: false },
   *     // ... resto de respuestas
   *   ]
   * });
   * ```
   */
  submitAreaAnswers: async (
    data: SubmitAreaAnswersRequest
  ): Promise<SubmitAreaAnswersResponse> => {
    const result = await apiClient.post<SubmitAreaAnswersResponse>('/answers/submit-area', data);
    
    // Invalidar cachés después de enviar respuestas (actualiza scores)
    apiCache.remove('lifewheel_me');
    apiCache.remove('user_me');
    
    return result;
  },
};

