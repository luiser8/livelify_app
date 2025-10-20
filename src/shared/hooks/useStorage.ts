import { AuthUser } from '../types/auth.types';
import { apiCache } from '../utils/apiCache';

/**
 * Hook personalizado para manejar localStorage
 * Gestiona el almacenamiento y recuperación de datos de autenticación
 */
const useStorage = () => {
  /**
   * Obtiene el userId desde localStorage
   */
  const getUserIdStorage = (): string | null => {
    return window.localStorage.getItem('userId');
  };

  /**
   * Obtiene el email desde localStorage
   */
  const getEmailStorage = (): string | null => {
    return window.localStorage.getItem('email');
  };

  /**
   * Obtiene el firstName desde localStorage
   */
  const getFirstNameStorage = (): string | null => {
    return window.localStorage.getItem('firstName');
  };

  /**
   * Obtiene el lastName desde localStorage
   */
  const getLastNameStorage = (): string | null => {
    return window.localStorage.getItem('lastName');
  };

  /**
   * Obtiene el phone desde localStorage
   */
  const getPhoneStorage = (): string | null => {
    return window.localStorage.getItem('phone');
  };

  /**
   * Obtiene el token desde localStorage
   */
  const getTokenStorage = (): string | null => {
    return window.localStorage.getItem('access_token');
  };

    /**
   * Obtiene el refresh token desde localStorage
   */
    const getRefreshTokenStorage = (): string | null => {
      return window.localStorage.getItem('refresh_token');
    };

  /**
   * Guarda los datos del usuario en localStorage
   */
  const saveUserToStorage = (userData: AuthUser): void => {
    window.localStorage.setItem('userId', userData.userId);
    window.localStorage.setItem('email', userData.email);
    window.localStorage.setItem('firstName', userData.firstName);
    window.localStorage.setItem('lastName', userData.lastName);
    window.localStorage.setItem('phone', userData.phone);
    window.localStorage.setItem('access_token', userData.access_token);
    window.localStorage.setItem('refresh_token', userData.refresh_token);
  };

  /**
   * Elimina todos los datos del usuario de localStorage
   * IMPORTANTE: También limpia TODO el caché del API para que el siguiente
   * usuario que inicie sesión no vea datos del usuario anterior
   */
  const clearUserFromStorage = (): void => {
    // Limpiar datos de autenticación
    window.localStorage.removeItem('userId');
    window.localStorage.removeItem('email');
    window.localStorage.removeItem('firstName');
    window.localStorage.removeItem('lastName');
    window.localStorage.removeItem('phone');
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('refresh_token');
    window.localStorage.removeItem('userAreaSelection');

    // Limpiar TODO el caché del API (api_cache_*)
    apiCache.clearAll();
  };

  /**
   * Obtiene todos los datos del usuario desde localStorage
   */
  const getUserFromStorage = (): AuthUser | null => {
    const userId = getUserIdStorage();
    const email = getEmailStorage();
    const firstName = getFirstNameStorage();
    const lastName = getLastNameStorage();
    const phone = getPhoneStorage();
    const access_token = getTokenStorage();
    const refresh_token = getRefreshTokenStorage();

    if (!userId || !email || !access_token || !refresh_token) {
      return null;
    }

    return {
      userId,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      access_token,
      refresh_token,
    };
  };

  return {
    getUserIdStorage,
    getEmailStorage,
    getFirstNameStorage,
    getLastNameStorage,
    getPhoneStorage,
    getTokenStorage,
    getRefreshTokenStorage,
    saveUserToStorage,
    clearUserFromStorage,
    getUserFromStorage,
  };
};

export default useStorage;

