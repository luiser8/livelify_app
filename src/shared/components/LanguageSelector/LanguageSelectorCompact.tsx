import { useTranslation } from 'react-i18next';

/**
 * Selector de idioma compacto para headers blancos
 */
export const LanguageSelectorCompact = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => changeLanguage('es')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          currentLanguage === 'es'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Cambiar a español"
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
          currentLanguage === 'en'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
};

