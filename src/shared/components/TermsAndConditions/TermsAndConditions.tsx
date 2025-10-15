import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { documentsService } from '@/infrastructure/services/documentsService';

interface TermsAndConditionsProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptRead?: () => void; // Callback cuando el usuario da clic en "Entendido"
}

/**
 * Modal para mostrar términos y condiciones desde PDF
 */
export const TermsAndConditions = ({ isOpen, onClose, onAcceptRead }: TermsAndConditionsProps) => {
  const { t, i18n } = useTranslation();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset scroll state when modal closes
      setHasScrolledToBottom(false);
      return;
    }

    let blobUrl: string | null = null;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      setHasScrolledToBottom(false);

      try {
        // Obtener el idioma actual de i18n (ej: 'en', 'es')
        const currentLanguage = i18n.language;

        const blob = await documentsService.getPdf(currentLanguage, 'terms');
        blobUrl = documentsService.createBlobUrl(blob);
        // Agregar parámetros para ocultar menús y barras de herramientas del PDF
        const cleanPdfUrl = `${blobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`;
        setPdfUrl(cleanPdfUrl);
      } catch (err) {
        console.error('Error loading terms PDF:', err);
        setError(t('terms.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();

    // Cleanup: revocar la URL del blob cuando el componente se desmonte
    return () => {
      if (blobUrl) {
        documentsService.revokeBlobUrl(blobUrl);
      }
    };
  }, [isOpen, t, i18n.language]);

  // Handle scroll detection
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Check if user has scrolled to near the bottom (within 50px)
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (isNearBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('terms.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - PDF Viewer */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto bg-gray-100"
        >
          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600 text-lg">{t('terms.loading')}</p>
            </div>
          )}

          {error && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-800">{t('common.error')}</h3>
                </div>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t('common.close')}
              </button>
            </div>
          )}

          {!isLoading && !error && pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full"
              title={t('terms.title')}
              style={{ border: 'none', height: '200vh', display: 'block' }}
              allow="fullscreen"
              scrolling="no"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          {/* Indicator message */}
          {!hasScrolledToBottom && !isLoading && !error && (
            <div className="flex items-center justify-center gap-2 text-amber-600 text-sm">
              <svg className="w-5 h-5 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{t('terms.scrollToEnable')}</span>
            </div>
          )}

          <button
            onClick={() => {
              if (onAcceptRead) {
                onAcceptRead(); // Notificar que el usuario leyó los términos
              }
              onClose();
            }}
            disabled={isLoading || !hasScrolledToBottom}
            className="w-full py-3 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {t('terms.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

