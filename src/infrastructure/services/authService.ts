import { apiClient } from '../api/client';

/**
 * Servicio de autenticación
 * Maneja las peticiones relacionadas con autenticación
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  /**
   * Inicia sesión con email y password
   * Endpoint: POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  /**
   * Cierra la sesión del usuario
   * Endpoint: POST /auth/logout
   */
  logout: async (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },

  /**
   * Obtiene la información del usuario actual
   * Endpoint: GET /auth/me
   */
  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Refresca el token de autenticación
   * Endpoint: POST /auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refresh_token: refreshToken });
  },
};

