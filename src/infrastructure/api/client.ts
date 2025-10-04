import { env } from '../../config/env';
import type { ApiError } from '../../shared/types';

/**
 * Cliente API centralizado
 * Maneja todas las peticiones HTTP a la API
 */

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Obtener access_token del localStorage si existe
    const token = localStorage.getItem('access_token');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Intentar parsear la respuesta como JSON
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // Crear error con el mensaje del servidor si está disponible
        const error: ApiError = {
          message: data?.message || data?.error || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          code: data?.code,
        };

        // Si es 401, disparar evento personalizado para sesión expirada
        // SOLO si hay un token (usuario ya autenticado)
        const hasToken = localStorage.getItem('access_token');
        if (response.status === 401 && hasToken) {
          window.dispatchEvent(new CustomEvent('session-expired'));
        }

        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient(env.API_URL || 'http://localhost:3000/api/v1');

