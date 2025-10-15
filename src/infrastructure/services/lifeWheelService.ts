import { apiClient } from '../api/client';

/**
 * Servicio de Life Wheel
 * Maneja las peticiones relacionadas con el Life Wheel
 */

export interface LifeArea {
  id: string;
  areaId: string;
  areaName: string;
  score: number;
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

export const lifeWheelService = {
  /**
   * Obtiene el Life Wheel del usuario actual
   * Endpoint: GET /lifewheel/me
   * Requiere: Bearer token en Authorization header (automático)
   */
  getMyLifeWheel: async (): Promise<LifeWheelResponse> => {
    return apiClient.get<LifeWheelResponse>('/lifewheel/me');
  },

  /**
   * Obtiene el Life Wheel del usuario actual
   * Endpoint: POST /lifewheel/add-lifewheel-areas
   * Requiere: Bearer token en Authorization header (automático)
   */
  addLifeWheelAreas: async (data: LifeWheelSelectedAreasRequest): Promise<LifeWheelSelectedAreasResponse> => {
    return apiClient.post<LifeWheelSelectedAreasResponse>('/lifewheel/add-lifewheel-areas', data);
  },
};
