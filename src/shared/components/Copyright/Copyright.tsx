import { useTranslation } from 'react-i18next';

interface CopyrightProps {
  variant?: 'light' | 'dark';
}

/**
 * Copyright Component
 * Displays copyright information with current year
 * Designed to work with BottomNav and auth pages
 */
export const Copyright = ({ variant = 'light' }: CopyrightProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const isDark = variant === 'dark';

  return (
    <div className="w-full pt-1 pb-2 mb-0 text-center bg-transparent">
      <p className={`text-xs sm:text-sm ${isDark ? 'text-white/70' : 'text-gray-600/70'}`}>
        {t('footer.createdBy')}{' '}
        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>flowpartners</span>
      </p>
      <p className={`text-xs mt-1 ${isDark ? 'text-white/70' : 'text-gray-500/70'}`}>
        © {currentYear} Livelify. {t('footer.allRightsReserved')}
      </p>
    </div>
  );
};

