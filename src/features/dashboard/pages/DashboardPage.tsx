import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BottomNav, LanguageSelectorCompact, Copyright, LifeScoreCard } from '@/shared/components';
import { userService, type UserMeResponse } from '@/infrastructure/services';
import { getAreaTranslationKey, getAreaIcon } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página de Dashboard
 */
export const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<UserMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await userService.getMe();
        setData(response);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{t('dashboard.noData')}</p>
      </div>
    );
  }

  const { user, lifeWheel, summary } = data;
  
  // Calculate pending items
  const pendingGoals = summary.totalGoals - summary.completedGoals;
  const pendingActions = summary.totalActions - summary.completedActions;
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 18) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {getGreeting()}, {user.firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex-shrink-0">
            <LanguageSelectorCompact />
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Life Score */}
          <LifeScoreCard score={lifeWheel.globalScore} variant="compact" />

          {/* Total Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">{summary.totalGoals}</div>
            <div className="text-xs sm:text-sm text-gray-600 leading-tight">{t('dashboard.stats.totalGoals')}</div>
          </div>

          {/* Completed Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold text-green-600 mb-1 sm:mb-2">{summary.completedGoals}</div>
            <div className="text-xs sm:text-sm text-gray-600 leading-tight">{t('dashboard.stats.completedGoals')}</div>
          </div>

          {/* Pending Goals */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold text-yellow-600 mb-1 sm:mb-2">{pendingGoals}</div>
            <div className="text-xs sm:text-sm text-gray-600 leading-tight">{t('dashboard.stats.pendingGoals')}</div>
          </div>
        </div>

        {/* Actions Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">{t('dashboard.actionsOverview.title')}</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{summary.totalActions}</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-tight">{t('dashboard.actionsOverview.totalActions')}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{summary.completedActions}</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-tight">{t('dashboard.actionsOverview.completed')}</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-xl">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{pendingActions}</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-tight">{t('dashboard.actionsOverview.pending')}</div>
            </div>
          </div>
        </div>

        {/* Life Wheel Areas */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{t('dashboard.lifeAreas.title')}</h3>
            <button 
              onClick={() => navigate('/home')}
              className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
            >
              {t('dashboard.lifeAreas.viewWheel')}
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3">
          {lifeWheel.lifeAreas.map((area) => {
            const translationKey = getAreaTranslationKey(area.areaName);
            const icon = getAreaIcon(area.areaName);
            const totalProjects = area.projects?.length || 0;

            return (
              <div 
                key={area.id} 
                onClick={() => navigate(`/area/${area.id}/projects`)}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{t(translationKey)}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{totalProjects} {t('dashboard.lifeAreas.projects')}</p>
                </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{area.score}</div>
                    <div className="text-xs text-gray-500">/10</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Copyright />
      <BottomNav />
    </div>
  );
};
