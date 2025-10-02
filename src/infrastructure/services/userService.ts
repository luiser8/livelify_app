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

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  address: string;
  phone: string;
  avatarUrl: string;
}

export interface LifeWheel {
  id: string;
  globalScore: number;
  lifeAreas: Array<{
    id: string;
    areaId: string;
    areaName: string;
    score: number;
  }>;
}

export interface RegisterResponse {
  id: string;
  email: string;
  profile: UserProfile;
  lifeWheel: LifeWheel;
  createdAt: string;
}

export interface UserMeResponse {
  id: string;
  email: string;
  profile: UserProfile;
  lifeWheel: LifeWheel;
  createdAt: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  address?: string;
  phone?: string;
  avatarUrl?: string;
}

export const userService = {
  /**
   * Registra un nuevo usuario
   * Endpoint: POST /users/register
   * No requiere autenticación
   */
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/users/register', credentials);
  },

  /**
   * Obtiene el perfil del usuario actual
   * Endpoint: GET /users/me
   * Requiere: Bearer token en Authorization header (automático)
   */
  getMe: async (): Promise<UserMeResponse> => {
    return apiClient.get<UserMeResponse>('/users/me');
  },

  /**
   * Actualiza el perfil del usuario
   * Endpoint: PUT /users/update
   * Requiere: Bearer token en Authorization header (automático)
   */
  updateUser: async (data: UpdateUserData): Promise<UserMeResponse> => {
    return apiClient.put<UserMeResponse>('/users/update', data);
  },
};

