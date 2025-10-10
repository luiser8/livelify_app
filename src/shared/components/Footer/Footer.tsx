import { useTranslation } from 'react-i18next';

/**
 * Footer Component
 * Displays creator information at the bottom of pages
 */
export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full py-4 mt-4 text-center">
      <p className="text-xs sm:text-sm text-white/70">
        {t('footer.createdBy')}{' '}
        <span className="font-semibold text-white/90">flowpartners</span>
      </p>
    </footer>
  );
};

