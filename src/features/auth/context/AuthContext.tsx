import React, { createContext, useState, useEffect, useContext } from 'react';
import useStorage from '../../../shared/hooks/useStorage';
import { AuthContextType } from './AuthContext.types';
import { AuthUser, authUserInitial } from '../../../shared/types/auth.types';

/**
 * Contexto de autenticación
 */
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider del contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    getUserIdStorage,
    getEmailStorage,
    getTokenStorage,
    getRefreshTokenStorage,
    saveUserToStorage,
    clearUserFromStorage,
    getUserFromStorage,
  } = useStorage();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Efecto para cargar el usuario desde localStorage al iniciar
   */
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = getUserFromStorage();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = !!user && !!user.access_token;

  /**
   * Obtiene el userId del usuario actual
   */
  const getUserId = (): string | null => {
    return user?.userId || getUserIdStorage();
  };

  /**
   * Obtiene el email del usuario actual
   */
  const getEmail = (): string | null => {
    return user?.email || getEmailStorage();
  };

  /**
   * Obtiene el token del usuario actual
   */
  const getToken = (): string | null => {
    return user?.access_token || getTokenStorage();
  };

    /**
   * Obtiene el refresh token del usuario actual
   */
    const getRefreshToken = (): string | null => {
      return user?.refresh_token || getRefreshTokenStorage();
    };

  /**
   * Inicia sesión con los datos del usuario
   */
  const login = (userData: AuthUser): void => {
    saveUserToStorage(userData);
    setUser(userData);
  };

  /**
   * Cierra la sesión del usuario
   * La limpieza del caché se hace automáticamente en clearUserFromStorage()
   */
  const logout = (): void => {
    clearUserFromStorage(); // Limpia user data + caché del API
    setUser(authUserInitial);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    setUser,
    getToken,
    getRefreshToken,
    getUserId,
    getEmail,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};

