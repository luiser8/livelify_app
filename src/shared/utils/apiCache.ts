/**
 * Sistema de Caché para API con localStorage
 * 
 * Características:
 * - TTL (Time To Live): Expiración por tiempo
 * - Contador de accesos: Cada N accesos al caché, refresca desde API
 * - Caché por clave única
 * - Limpieza automática de caché expirado
 * - Configuración desde variables de entorno
 */

import { env } from '@/config/env';

export interface CacheConfig {
  /**
   * Tiempo de vida del caché en milisegundos
   * Por defecto: desde VITE_CACHE_TTL (5 minutos)
   */
  ttl?: number;

  /**
   * Número máximo de accesos al caché antes de refrescar desde API
   * Por defecto: desde VITE_CACHE_ACCESS_COUNT (10 accesos)
   */
  maxAccessCount?: number;

  /**
   * Prefijo para las claves en localStorage
   * Por defecto: desde VITE_CACHE_KEY_PREFIX ('api_cache_')
   */
  keyPrefix?: string;
}

interface CacheData<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  ttl: number;
  maxAccessCount: number;
}

const DEFAULT_TTL = env.CACHE_TTL;
const DEFAULT_MAX_ACCESS_COUNT = env.CACHE_ACCESS_COUNT;
const DEFAULT_KEY_PREFIX = env.CACHE_KEY_PREFIX;

export class ApiCache {
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl ?? DEFAULT_TTL,
      maxAccessCount: config.maxAccessCount ?? DEFAULT_MAX_ACCESS_COUNT,
      keyPrefix: config.keyPrefix ?? DEFAULT_KEY_PREFIX,
    };
  }

  /**
   * Genera la clave completa para el caché
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Verifica si el caché es válido (no expirado y dentro del límite de accesos)
   */
  private isValid<T>(cacheData: CacheData<T>): boolean {
    const now = Date.now();
    const isNotExpired = now - cacheData.timestamp < cacheData.ttl;
    const hasAccessesRemaining = cacheData.accessCount < cacheData.maxAccessCount;

    return isNotExpired && hasAccessesRemaining;
  }

  /**
   * Obtiene datos del caché
   * @param key - Clave única para identificar los datos
   * @returns Los datos si existen y son válidos, null en caso contrario
   */
  get<T>(key: string): T | null {
    try {
      const fullKey = this.getFullKey(key);
      const cached = localStorage.getItem(fullKey);

      if (!cached) {
        return null;
      }

      const cacheData: CacheData<T> = JSON.parse(cached);

      // Verificar si el caché es válido
      if (!this.isValid(cacheData)) {
        // Limpiar caché expirado
        this.remove(key);
        return null;
      }

      // Incrementar contador de accesos
      cacheData.accessCount++;
      localStorage.setItem(fullKey, JSON.stringify(cacheData));

      return cacheData.data;
    } catch (error) {
      console.error('[ApiCache] ❌ Error al obtener del caché:', error);
      return null;
    }
  }

  /**
   * Guarda datos en el caché
   * @param key - Clave única para identificar los datos
   * @param data - Datos a guardar
   * @param customConfig - Configuración personalizada para este item específico
   */
  set<T>(key: string, data: T, customConfig?: Partial<CacheConfig>): void {
    try {
      const fullKey = this.getFullKey(key);
      const cacheData: CacheData<T> = {
        data,
        timestamp: Date.now(),
        accessCount: 0,
        ttl: customConfig?.ttl ?? this.config.ttl,
        maxAccessCount: customConfig?.maxAccessCount ?? this.config.maxAccessCount,
      };

      localStorage.setItem(fullKey, JSON.stringify(cacheData));

    } catch (error) {
      console.error('[ApiCache] ❌ Error al guardar en caché:', error);
    }
  }

  /**
   * Elimina un item específico del caché
   * @param key - Clave del item a eliminar
   */
  remove(key: string): void {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error('[ApiCache] ❌ Error al eliminar del caché:', error);
    }
  }

  /**
   * Limpia todo el caché (solo items con el prefijo configurado)
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.config.keyPrefix));

      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });

    } catch (error) {
      console.error('[ApiCache] ❌ Error al limpiar caché:', error);
    }
  }

  /**
   * Obtiene estadísticas del caché para una clave específica
   */
  getStats(key: string): { exists: boolean; accessCount?: number; remainingTime?: number; remainingAccesses?: number } | null {
    try {
      const fullKey = this.getFullKey(key);
      const cached = localStorage.getItem(fullKey);

      if (!cached) {
        return { exists: false };
      }

      const cacheData: CacheData<unknown> = JSON.parse(cached);
      const now = Date.now();
      const remainingTime = cacheData.ttl - (now - cacheData.timestamp);
      const remainingAccesses = cacheData.maxAccessCount - cacheData.accessCount;

      return {
        exists: true,
        accessCount: cacheData.accessCount,
        remainingTime: Math.max(0, remainingTime),
        remainingAccesses: Math.max(0, remainingAccesses),
      };
    } catch (error) {
      console.error('[ApiCache] ❌ Error al obtener estadísticas:', error);
      return null;
    }
  }

  /**
   * Limpia caché expirado (útil para mantenimiento)
   */
  cleanExpired(): number {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.config.keyPrefix));
      let removedCount = 0;

      cacheKeys.forEach(fullKey => {
        try {
          const cached = localStorage.getItem(fullKey);
          if (cached) {
            const cacheData: CacheData<unknown> = JSON.parse(cached);
            if (!this.isValid(cacheData)) {
              localStorage.removeItem(fullKey);
              removedCount++;
            }
          }
        } catch {
          // Si hay error al parsear, eliminar el item corrupto
          localStorage.removeItem(fullKey);
          removedCount++;
        }
      });

      return removedCount;
    } catch (error) {
      console.error('[ApiCache] ❌ Error al limpiar caché expirado:', error);
      return 0;
    }
  }
}

/**
 * Wrapper para cachear llamadas a APIs
 * 
 * @param cacheKey - Clave única para identificar esta llamada
 * @param apiFn - Función que hace la llamada al API
 * @param cache - Instancia de ApiCache
 * @param config - Configuración opcional para este caché
 * 
 * @example
 * ```typescript
 * const apiCache = new ApiCache({ ttl: 300000, maxAccessCount: 10 });
 * 
 * const getUserData = () => cacheApiCall(
 *   'user_me',
 *   () => userService.getMe(),
 *   apiCache
 * );
 * ```
 */
export async function cacheApiCall<T>(
  cacheKey: string,
  apiFn: () => Promise<T>,
  cache: ApiCache,
  config?: Partial<CacheConfig>
): Promise<T> {
  // Intentar obtener del caché
  const cached = cache.get<T>(cacheKey);
  
  if (cached !== null) {
    return cached;
  }

  // Si no hay caché válido, hacer la llamada al API
  const data = await apiFn();
  
  // Guardar en caché
  cache.set(cacheKey, data, config);
  
  return data;
}

/**
 * Instancia global del caché con configuración por defecto
 * Valores tomados de variables de entorno:
 * - TTL: VITE_CACHE_TTL (default: 5 minutos)
 * - Max accesos: VITE_CACHE_ACCESS_COUNT (default: 10)
 * - Prefijo: VITE_CACHE_KEY_PREFIX (default: 'api_cache_')
 */
export const apiCache = new ApiCache({
  ttl: env.CACHE_TTL,
  maxAccessCount: env.CACHE_ACCESS_COUNT,
  keyPrefix: env.CACHE_KEY_PREFIX,
});

/**
 * Limpia el caché automáticamente al iniciar la aplicación
 * (elimina items expirados)
 */
export function initializeCache(): void {
  apiCache.cleanExpired();
}

