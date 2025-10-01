import { apiClient } from '../api/client';

/**
 * Servicio de usuarios
 * Maneja las peticiones relacionadas con usuarios
 */

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    address: string;
    phone: string;
    avatarUrl: string;
  };
  lifeWheel: {
    id: string;
    globalScore: number;
    lifeAreas: Array<{
      id: string;
      areaId: string;
      areaName: string;
      score: number;
    }>;
  };
  createdAt: string;
}

export const userService = {
  /**
   * Registra un nuevo usuario
   * Endpoint: POST /users/register
   */
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/users/register', credentials);
  },

  /**
   * Obtiene el perfil del usuario actual
   * Endpoint: GET /users/profile
   */
  getProfile: async () => {
    return apiClient.get('/users/profile');
  },

  /**
   * Actualiza el perfil del usuario
   * Endpoint: PUT /users/profile
   */
  updateProfile: async (data: Partial<RegisterCredentials>) => {
    return apiClient.put('/users/profile', data);
  },
};

