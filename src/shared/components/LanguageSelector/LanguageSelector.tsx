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
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
      <button
        onClick={() => changeLanguage('es')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
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
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
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

