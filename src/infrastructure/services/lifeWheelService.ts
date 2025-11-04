import { apiClient } from '../api/client';
import { cacheApiCall, apiCache } from '@/shared/utils/apiCache';

/**
 * Servicio de Life Wheel
 * Maneja las peticiones relacionadas con el Life Wheel
 */

export interface LifeArea {
  id: string;
  areaId: string;
  areaName: string;
  score: number;
  isArchived: boolean;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LifeWheelSelectedAreas {
  areaId: string;
  score: number;
}

export interface LifeWheelSelectedAreasRequest {
  userId?: string | null;
  lifeWheelId?: string;
  areaIds?: LifeWheelSelectedAreas[];
}

export interface LifeWheelResponse {
  id: string;
  userId: string;
  globalScore: number;
  isAnswered?: boolean;
  lifeAreas: LifeArea[];
  lifeAreasSelected: LifeWheelSelectedAreas[];
  createdAt: string;
  updatedAt: string;
}

export interface LifeWheelSelectedAreasResponse {
  success: boolean;
  selectedAreas: Array<{
    id: string;
    userId: string;
    lifeWheelId: string;
    areaId: string;
    score: number;
    createdAt: Date;
  }>;
}

export interface UnlockAreasRequest {
  lifeWheelAreaIds: string[];
}

export interface UnlockAreasResponse {
  success: boolean;
  message?: string;
  unlockedAreas?: Array<{
    id: string;
    isBlocked: boolean;
  }>;
}

export const lifeWheelService = {
  /**
   * Obtiene el Life Wheel del usuario actual (CON CACHÉ)
   * Endpoint: GET /lifewheel/me
   * Requiere: Bearer token en Authorization header (automático)
   *
   * Configuración de caché:
   * - Tipo: NORMAL (desde env)
   * - TTL: VITE_CACHE_TTL_NORMAL
   * - Max accesos: VITE_CACHE_MAX_ACCESS_NORMAL
   */
  getMyLifeWheel: async (): Promise<LifeWheelResponse> => {
    return cacheApiCall(
      'lifewheel_me',
      () => apiClient.get<LifeWheelResponse>('/lifewheel/me'),
      apiCache,
    );
  },

  /**
   * Agrega áreas al Life Wheel
   * Endpoint: POST /lifewheel/add-lifewheel-areas
   * Requiere: Bearer token en Authorization header (automático)
   *
   * NOTA: Invalida el caché después de agregar áreas
   */
  addLifeWheelAreas: async (data: LifeWheelSelectedAreasRequest): Promise<LifeWheelSelectedAreasResponse> => {
    const result = await apiClient.post<LifeWheelSelectedAreasResponse>('/lifewheel/add-lifewheel-areas', data);
    // Invalidar caché después de agregar áreas
    apiCache.remove('lifewheel_me');
    apiCache.remove('user_me'); // También invalidar user_me porque contiene lifeWheel
    return result;
  },

  /**
   * Desbloquea áreas del Life Wheel
   * Endpoint: POST /lifewheel/unlock-areas
   * Requiere: Bearer token en Authorization header (automático)
   *
   * @param data - Objeto con array de IDs de áreas a desbloquear
   * @returns Respuesta con las áreas desbloqueadas
   *
   * NOTA: Invalida el caché después de desbloquear áreas
   */
  unlockAreas: async (data: UnlockAreasRequest): Promise<UnlockAreasResponse> => {
    const result = await apiClient.post<UnlockAreasResponse>('/lifewheel/unlock-areas', data);
    // Invalidar caché después de desbloquear áreas
    apiCache.remove('lifewheel_me');
    apiCache.remove('user_me'); // También invalidar user_me porque contiene lifeWheel
    return result;
  },

  /**
   * Marca el Life Wheel como completamente respondido
   * Endpoint: PUT /lifewheel/mark-as-answered
   * Requiere: Bearer token en Authorization header (automático)
   *
   * @returns Respuesta con el Life Wheel actualizado
   *
   * NOTA: Invalida el caché después de marcar como respondido
   */
  markAsAnswered: async (): Promise<LifeWheelResponse> => {
    const result = await apiClient.put<LifeWheelResponse>('/lifewheel/mark-as-answered');
    // Invalidar caché después de marcar como respondido
    apiCache.remove('lifewheel_me');
    apiCache.remove('user_me'); // También invalidar user_me porque contiene lifeWheel
    return result;
  },
};
