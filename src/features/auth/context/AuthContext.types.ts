import { AuthUser } from '../../../shared/types/auth.types';

/**
 * Tipos del contexto de autenticación
 */
export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  getUserId: () => string | null;
  getEmail: () => string | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
}

