import { useTranslation } from 'react-i18next';

/**
 * Selector de idioma (ES/EN)
 */
export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-0.5 sm:p-1">
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/30 ${
          currentLanguage === 'es'
            ? 'bg-white text-gray-900 shadow-md'
            : 'text-white/80 hover:text-white hover:bg-white/5'
        }`}
        aria-label="Cambiar a español"
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/30 ${
          currentLanguage === 'en'
            ? 'bg-white text-gray-900 shadow-md'
            : 'text-white/80 hover:text-white hover:bg-white/5'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
};

