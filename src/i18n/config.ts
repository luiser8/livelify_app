import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import translationEN from './locales/en.json';
import translationES from './locales/es.json';

// Recursos de traducción
const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
};

// Configuración de i18next
i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Idioma por defecto si no se detecta
    lng: 'es', // Idioma inicial (español como preferencia)
    debug: false, // Activar en desarrollo si necesitas debug
    
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    detection: {
      // Orden de detección del idioma
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Caché del idioma seleccionado
      caches: ['localStorage'],
      // Key para guardar en localStorage
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;

