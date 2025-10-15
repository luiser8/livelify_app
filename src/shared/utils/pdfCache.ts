/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Utilidad para cachear PDFs en localStorage
 * Cachea los PDFs por 24 horas para mejorar el rendimiento
 */

interface CachedPdf {
  data: string; // PDF en base64
  timestamp: number;
  language: string;
}

const CACHE_KEY_PREFIX = 'pdf_cache_';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export const pdfCache = {
  /**
   * Guarda un PDF en el caché
   * @param key - Clave única para el PDF (ej: 'terms_en')
   * @param blob - Blob del PDF
   * @param language - Código de idioma
   */
  set: async (key: string, blob: Blob, language: string): Promise<void> => {
    try {
      // Convertir blob a base64
      const base64 = await blobToBase64(blob);

      const cachedData: CachedPdf = {
        data: base64,
        timestamp: Date.now(),
        language: language.toLowerCase(),
      };

      const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch {
      // Si hay error (por ejemplo, localStorage lleno), simplemente no cacheamos
    }
  },

  /**
   * Obtiene un PDF del caché si existe y es válido
   * @param key - Clave única para el PDF
   * @param language - Código de idioma
   * @returns Blob del PDF o null si no existe o expiró
   */
  get: async (key: string, language: string): Promise<Blob | null> => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
      const cachedDataString = localStorage.getItem(cacheKey);

      if (!cachedDataString) {
        console.log(`[PDF Cache] No cache found for ${key}`);
        return null;
      }

      const cachedData: CachedPdf = JSON.parse(cachedDataString);

      // Verificar si el idioma coincide
      if (cachedData.language !== language.toLowerCase()) {
        return null;
      }

      // Verificar si el caché ha expirado (más de 24 horas)
      const now = Date.now();
      const age = now - cachedData.timestamp;

      if (age > CACHE_DURATION_MS) {
        // Eliminar caché expirado
        localStorage.removeItem(cacheKey);
        return null;
      }

      // Convertir base64 de vuelta a blob
      const blob = base64ToBlob(cachedData.data, 'application/pdf');
      return blob;
    } catch {
      return null;
    }
  },

  /**
   * Invalida (elimina) un PDF específico del caché
   * @param key - Clave única para el PDF
   */
  invalidate: (key: string): void => {
    const cacheKey = `${CACHE_KEY_PREFIX}${key}`;
    localStorage.removeItem(cacheKey);
  },

  /**
   * Limpia todos los PDFs cacheados
   */
  clearAll: (): void => {
    const keys = Object.keys(localStorage);
    let cleared = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
  },

  /**
   * Limpia solo los PDFs expirados
   */
  cleanExpired: (): void => {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cachedDataString = localStorage.getItem(key);
          if (cachedDataString) {
            const cachedData: CachedPdf = JSON.parse(cachedDataString);
            const age = now - cachedData.timestamp;

            if (age > CACHE_DURATION_MS) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // Si hay error al parsear, eliminar el item corrupto
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(`[PDF Cache] Cleaned ${cleaned} expired PDFs`);
    }
  },

  /**
   * Obtiene información sobre el estado del caché
   */
  getStats: (): { totalCached: number; totalSize: number; items: Array<{ key: string; age: number; language: string }> } => {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const items: Array<{ key: string; age: number; language: string }> = [];
    let totalSize = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        try {
          const cachedDataString = localStorage.getItem(key);
          if (cachedDataString) {
            totalSize += cachedDataString.length;
            const cachedData: CachedPdf = JSON.parse(cachedDataString);
            const age = now - cachedData.timestamp;

            items.push({
              key: key.replace(CACHE_KEY_PREFIX, ''),
              age: Math.round(age / 1000 / 60), // edad en minutos
              language: cachedData.language,
            });
          }
        } catch (error) {
          // Ignorar items corruptos
        }
      }
    });

    return {
      totalCached: items.length,
      totalSize: Math.round(totalSize / 1024), // en KB
      items,
    };
  },
};

/**
 * Convierte un Blob a string base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remover el prefijo "data:application/pdf;base64,"
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convierte un string base64 a Blob
 */
function base64ToBlob(base64: string, contentType: string = ''): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

// Limpiar PDFs expirados al cargar la aplicación
if (typeof window !== 'undefined') {
  // Ejecutar limpieza en el próximo tick para no bloquear la carga inicial
  setTimeout(() => {
    pdfCache.cleanExpired();
  }, 1000);
}

