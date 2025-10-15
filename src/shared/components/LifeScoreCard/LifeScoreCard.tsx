import { useTranslation } from 'react-i18next';

interface LifeScoreCardProps {
  score: number;
  variant?: 'default' | 'compact';
}

/**
 * Componente para mostrar el Global Score / Life Score
 * Reutilizable en Home, Dashboard, etc.
 */
export const LifeScoreCard = ({ score, variant = 'default' }: LifeScoreCardProps) => {
  const { t } = useTranslation();

  // Función para obtener el color del score según el valor
  const getScoreColor = (scoreValue: number) => {
    if (scoreValue < 5) return 'text-red-600';
    if (scoreValue < 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (variant === 'compact') {
    // Variante compacta para dashboard (grid)
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className={`text-4xl font-bold ${getScoreColor(score)} mb-2`}>
          {score.toFixed(1)}<span className="text-2xl text-gray-400 font-normal">/10</span>
        </div>
        <div className="text-sm text-gray-600">{t('dashboard.stats.lifeScore')}</div>
      </div>
    );
  }

  // Variante por defecto para home (inline)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 inline-block">
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
          {score.toFixed(1)}
          <span className="text-xl text-gray-400 font-normal">/10</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">{t('dashboard.stats.lifeScore')}</div>
      </div>
    </div>
  );
};

