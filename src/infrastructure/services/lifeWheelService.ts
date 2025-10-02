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

export interface LifeWheelResponse {
  id: string;
  userId: string;
  globalScore: number;
  lifeAreas: LifeArea[];
  createdAt: string;
  updatedAt: string;
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
};

