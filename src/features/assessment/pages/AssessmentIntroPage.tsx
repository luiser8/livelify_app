import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lifeWheelService, type LifeWheelResponse } from '@/infrastructure/services';
import { getAreaIcon, getAreaTranslationKey } from '@/shared/utils/lifeAreaHelpers';
import { BottomNav, PageHeader, Copyright } from '@/shared/components';

/**
 * Página de introducción al Life Wheel Assessment
 */
export const AssessmentIntroPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lifeWheel, setLifeWheel] = useState<LifeWheelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAsAnswered, setMarkingAsAnswered] = useState(false);

  useEffect(() => {
    const fetchLifeWheel = async () => {
      try {
        const data = await lifeWheelService.getMyLifeWheel();
        setLifeWheel(data);
      } catch (error) {
        console.error('Error fetching life wheel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLifeWheel();
  }, []);

  const handleAreaClick = (areaId: string, isArchived: boolean) => {
    // Si el área ya está evaluada (isArchived), no permitir responder de nuevo
    if (isArchived) {
      return;
    }
    navigate(`/assessment/area/${areaId}`);
  };

  const handleViewLifeWheel = async () => {
    setMarkingAsAnswered(true);
    try {
      // Marcar como respondido en el backend
      await lifeWheelService.markAsAnswered();
      
      // El cache ya se limpió automáticamente en el servicio
      // Navegar al home donde se recargará con isAnswered: true
      navigate('/home');
    } catch (error) {
      console.error('Error marking as answered:', error);
      // Navegar de todas formas
      navigate('/home');
    } finally {
      setMarkingAsAnswered(false);
    }
  };

  // Verificar si todas las áreas están completadas
  const allAreasCompleted = lifeWheel?.lifeAreas && lifeWheel.lifeAreas.length > 0 && 
    lifeWheel.lifeAreas.every(area => area.isArchived);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader 
        title={t('assessment.intro.title')}
        subtitle={t('assessment.intro.title')}
        backPath="/home"
        showSearch={false}
        showFilter={false}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* Icono y título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{t('assessment.intro.title')}</h1>
          <p className="text-base sm:text-lg text-gray-600">
            {t('assessment.intro.subtitle')}
          </p>
        </div>

        {/* Mensaje de éxito y botón al home - Mostrar si TODAS están completadas */}
        {allAreasCompleted ? (
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-green-900 mb-2">
                    🎉 {t('assessment.intro.allCompleted')}
                  </h3>
                  <p className="text-base sm:text-lg text-green-800 leading-relaxed">
                    {t('assessment.intro.allCompletedDesc')}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleViewLifeWheel}
                disabled={markingAsAnswered}
                className="w-full py-4 sm:py-5 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl sm:rounded-2xl transition-all shadow-lg text-base sm:text-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {markingAsAnswered ? t('assessment.intro.loading') : `${t('assessment.intro.viewLifeWheel')} →`}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Advertencia permanente - Solo mostrar si NO todas están completadas */}
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-red-900 mb-1">
                    {t('assessment.intro.permanentWarningTitle')}
                  </h3>
                  <p className="text-sm sm:text-base text-red-800">
                    {t('assessment.intro.permanentWarningDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensaje motivacional */}
            <div className="mb-6 sm:mb-8">
              <h2 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3">
                {t('assessment.intro.answerHonestlyTitle')}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {t('assessment.intro.answerHonestlyDesc')}
              </p>
            </div>
          </>
        )}

        {/* 6 Life Areas */}
        <div id="life-areas-section" className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-6">{t('assessment.intro.areasTitle')}</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">{t('assessment.intro.loadingAreas')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {lifeWheel?.lifeAreas
                .slice()
                .sort((a, b) => {
                  // Ordenar: completadas primero (isArchived), luego no completadas
                  const aCompleted = a.isArchived;
                  const bCompleted = b.isArchived;
                  if (aCompleted && !bCompleted) return -1;
                  if (!aCompleted && bCompleted) return 1;
                  return 0;
                })
                .map((area, index, sortedAreas) => {
                const isCompleted = area.isArchived;
                
                // Encontrar la primera área no completada (la siguiente sugerida)
                const firstIncompleteIndex = sortedAreas.findIndex(a => !a.isArchived);
                const isSuggested = !isCompleted && index === firstIncompleteIndex;
                
                return (
                  <button
                    key={area.id}
                    onClick={() => handleAreaClick(area.areaId, area.isArchived)}
                    disabled={isCompleted}
                    className={`bg-white border rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all text-left relative ${
                      isCompleted 
                        ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-75' 
                        : isSuggested
                          ? 'border-primary-500 shadow-lg scale-105 cursor-pointer ring-2 ring-primary-300 hover:shadow-xl hover:scale-110'
                          : 'border-gray-200 hover:shadow-lg hover:border-gray-300 hover:scale-105 cursor-pointer'
                    }`}
                  >
                    {/* Badge de completado */}
                    {isCompleted && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Badge de sugerido */}
                    {isSuggested && (
                      <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full px-2 py-1 text-xs font-semibold shadow-lg animate-pulse">
                        ⭐ {t('assessment.intro.next')}
                      </div>
                    )}
                    
                    <div className={`flex items-center justify-center text-3xl sm:text-4xl mb-2 sm:mb-3 ${isCompleted ? 'opacity-60' : ''}`} style={{ filter: isCompleted ? 'grayscale(50%)' : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' }}>
                      {getAreaIcon(area.areaName)}
                    </div>
                    <p className={`text-sm sm:text-base font-medium ${isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                      {t(getAreaTranslationKey(area.areaName))}
                    </p>
                    <p className={`text-xs sm:text-sm mt-1 ${isCompleted ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                      {isCompleted ? `✓ ${t('assessment.intro.completedScore', { score: area.score })}` : t('assessment.intro.currentScore', { score: area.score })}
                    </p>
                    <p className={`text-xs sm:text-sm mt-2 font-medium ${isCompleted ? 'text-gray-500' : 'text-primary-600'}`}>
                      {isCompleted ? t('assessment.intro.alreadyEvaluated') : t('assessment.intro.clickToEvaluate')}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-start gap-3 bg-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm font-bold">?</span>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-purple-900">{t('assessment.intro.questionsPerArea')}</h4>
              <p className="text-xs sm:text-sm text-purple-800">{t('assessment.intro.yesNoFormat')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-green-900">{t('assessment.intro.instantScoring')}</h4>
              <p className="text-xs sm:text-sm text-green-800">{t('assessment.intro.instantScoringDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-pink-900">{t('assessment.intro.identifiesFocus')}</h4>
              <p className="text-xs sm:text-sm text-pink-800">{t('assessment.intro.identifiesFocusDesc')}</p>
            </div>
          </div>
        </div>

        {/* Before you begin */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-6">{t('assessment.intro.beforeYouBegin')}</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t('assessment.intro.beHonestTitle')}</h4>
                <p className="text-xs text-gray-600">{t('assessment.intro.beHonestDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t('assessment.intro.thinkRecentTitle')}</h4>
                <p className="text-xs text-gray-600">{t('assessment.intro.thinkRecentDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t('assessment.intro.noJudgmentTitle')}</h4>
                <p className="text-xs text-gray-600">{t('assessment.intro.noJudgmentDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{t('assessment.intro.startingLineTitle')}</h4>
                <p className="text-xs text-gray-600">{t('assessment.intro.startingLineDesc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What happens after */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-6">{t('assessment.intro.whatHappensAfter')}</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{t('assessment.intro.step1')}</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{t('assessment.intro.step2')}</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{t('assessment.intro.step3')}</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">4</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{t('assessment.intro.step4')}</p>
            </div>
          </div>
        </div>

        {/* Time investment - Solo mostrar si NO todas están completadas */}
        {!allAreasCompleted && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⏱️</div>
              <div>
                <h4 className="text-sm font-semibold text-yellow-900 mb-1">{t('assessment.intro.timeInvestmentTitle')}</h4>
                <p className="text-sm text-yellow-800">
                  {t('assessment.intro.timeInvestmentDesc')}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Copyright />
      <BottomNav />
    </div>
  );
};

