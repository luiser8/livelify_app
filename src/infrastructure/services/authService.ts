import { apiClient } from '../api/client';
import type { LoginCredentials, LoginResponse } from '../../core/usecases/auth/loginUseCase';

/**
 * Servicio de autenticación
 * Maneja las peticiones relacionadas con autenticación
 */

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },
};

