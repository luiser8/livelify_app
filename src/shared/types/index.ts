/**
 * Tipos compartidos en toda la aplicación
 */

export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

export type ApiError = {
  message: string;
  code?: string;
  status?: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

