import { apiClient } from '../api/client';
import { pdfCache } from '@/shared/utils/pdfCache';

export type DocumentType = 'terms' | 'privacy';

/**
 * Servicio de términos y condiciones
 * Maneja las peticiones relacionadas con términos y condiciones
 * Incluye sistema de caché de 24 horas para mejorar el rendimiento
 */

export const documentsService = {
  /**
   * Obtiene el PDF de términos y condiciones
   * Primero verifica el caché, si no existe o expiró, hace la petición a la API
   * Endpoint: GET /terms/pdf/:language
   * @param language - Código de idioma (EN, ES, etc.)
   * @returns Blob (archivo PDF)
   */
  getPdf: async (language: string = 'EN', documentType: DocumentType): Promise<Blob> => {
    // Convertir el idioma a mayúsculas para el endpoint
    const languageCode = language.toUpperCase();
    const cacheKey = `${documentType}_${languageCode.toLowerCase()}`;

    // 1. Intentar obtener del caché primero
    const cachedBlob = await pdfCache.get(cacheKey, language);
    if (cachedBlob) {
      return cachedBlob;
    }

    // 2. Si no está en caché, hacer petición a la API
    const response = await fetch(`${apiClient.getBaseURL()}/documents/${documentType}/${languageCode}`, {
      method: 'GET',
      headers: {
        // No incluir Content-Type para que el servidor decida
        // No requiere autenticación, los términos y políticas son públicos
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch terms or privacy policy PDF: ${response.statusText}`);
    }

    const blob = await response.blob();

    // 3. Guardar en caché para futuras peticiones
    await pdfCache.set(cacheKey, blob, language);

    return blob;
  },

  /**
   * Invalida el caché de términos para un idioma específico
   * Útil cuando se actualizan los términos en el servidor
   * @param language - Código de idioma (EN, ES, etc.)
   */
  invalidateCache: (language: string = 'EN', documentType: DocumentType): void => {
    const languageCode = language.toUpperCase();
    const cacheKey = `${documentType}_${languageCode.toLowerCase()}`;
    pdfCache.invalidate(cacheKey);
  },

  /**
   * Invalida el caché de términos para todos los idiomas
   */
  invalidateAllCache: (): void => {
    pdfCache.clearAll();
  },

  /**
   * Crea una URL temporal para mostrar el PDF
   * @param blob - El blob del PDF obtenido
   * @returns URL temporal para usar en un iframe o visor
   */
  createBlobUrl: (blob: Blob): string => {
    return URL.createObjectURL(blob);
  },

  /**
   * Libera la URL temporal del blob
   * @param url - La URL creada con createBlobUrl
   */
  revokeBlobUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },
};

