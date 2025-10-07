import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BottomNav, PageHeader } from '@/shared/components';
import { LifeWheelHexagon } from '../components';
import { lifeWheelService, type LifeWheelResponse } from '@/infrastructure/services';
import { getAreaIcon, getAreaTranslationKey } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página principal - Life Wheel
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lifeWheel, setLifeWheel] = useState<LifeWheelResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleStartAssessment = () => {
    navigate('/assessment/intro');
  };

  const handleAreaClick = (areaId: string) => {
    navigate(`/area/${areaId}/projects`);
  };

  const hasScores = lifeWheel?.lifeAreas && lifeWheel.lifeAreas.some(area => area.score > 0);
  const allAreasAnswered = lifeWheel?.lifeAreas && lifeWheel.lifeAreas.length > 0 && 
    lifeWheel.lifeAreas.every(area => area.score > 0);

  // Obtener las áreas habilitadas para hacer clic
  const getEnabledAreas = () => {
    if (!lifeWheel?.lifeAreas) return new Set<string>();
    
    // SIEMPRE filtrar primero solo áreas evaluadas (score > 0)
    const evaluatedAreas = lifeWheel.lifeAreas.filter(area => area.score > 0);
    
    // Si no hay áreas evaluadas, no habilitar ninguna
    if (evaluatedAreas.length === 0) return new Set<string>();
    
    // Si TODAS las áreas están contestadas, de las evaluadas solo permitir las 3 más bajas
    if (allAreasAnswered) {
      const sortedAreas = [...evaluatedAreas].sort((a, b) => a.score - b.score);
      const lowestThree = sortedAreas.slice(0, 3);
      return new Set(lowestThree.map(area => area.id));
    }
    
    // Si no todas están contestadas, permitir todas las evaluadas
    return new Set(evaluatedAreas.map(area => area.id));
  };

  const enabledAreaIds = getEnabledAreas();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader 
        title={t('home.title')}
        subtitle={t('home.subtitle')}
        backPath="/"
        showSearch={false}
        showFilter={false}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6">
        {/* Hexágono del Life Wheel */}
        {loading ? (
          <div className="mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-sm sm:text-base">{t('home.loadingWheel')}</p>
          </div>
        ) : (
          <div className="mb-12 sm:mb-16">
            <LifeWheelHexagon 
              lifeAreas={lifeWheel?.lifeAreas || []} 
              onAreaClick={handleAreaClick}
              enabledAreaIds={enabledAreaIds}
            />
          </div>
        )}

        {/* Contenedor para botón y mensajes */}
        <div className="w-full pt-4">
          {/* Botón de acción - Solo mostrar si no todas las áreas están respondidas */}
          {!allAreasAnswered && (
            <>
              <button
                onClick={handleStartAssessment}
                className="w-full py-4 sm:py-5 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl sm:rounded-2xl transition-all shadow-lg text-base sm:text-lg"
              >
                {t('home.startAssessment')}
              </button>

              {/* Advertencia */}
              <div className="mt-6 p-4 sm:p-5 bg-amber-50 border-2 border-amber-200 rounded-xl sm:rounded-2xl">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 mt-0.5">
                    <svg className="w-full h-full text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                    <span className="font-semibold">{t('home.assessmentWarning.title')}</span> {t('home.assessmentWarning.description')}
                  </p>
                </div>
              </div>

              {/* Texto informativo */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t('home.assessmentInfo.description', { 
                    min: t('home.assessmentInfo.min'),
                    max: t('home.assessmentInfo.max'),
                    time: t('home.assessmentInfo.time')
                  })}
                </p>
              </div>

              {/* Mensaje adicional si algunas áreas ya están evaluadas */}
              {hasScores && !allAreasAnswered && (
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">{t('home.partialAssessment.title')}</p>
                      <p className="text-xs sm:text-sm text-blue-800">
                        {t('home.partialAssessment.description')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Mensaje cuando todas las áreas están respondidas */}
          {allAreasAnswered && (
            <>
              <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl sm:rounded-2xl mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">{t('home.assessmentCompleted.title')}</h3>
                    <p className="text-sm sm:text-base text-green-800 leading-relaxed">
                      {t('home.assessmentCompleted.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información sobre las áreas disponibles */}
              <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">{t('home.focusLowest.title')}</h4>
                    <p className="text-xs sm:text-sm text-blue-800">
                      {t('home.focusLowest.description', { count: 3 })}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scores Summary - Solo si hay scores */}
          {hasScores && lifeWheel && (
            <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">{t('home.currentScores')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {lifeWheel.lifeAreas
                  .sort((a, b) => a.score - b.score) // Ordenar por score ascendente
                  .map((area) => {
                    const isEnabled = enabledAreaIds.has(area.id);
                    return (
                      <div 
                        key={area.id} 
                        className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl transition-all ${
                          isEnabled 
                            ? 'bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 shadow-sm' 
                            : area.score === 0
                              ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300'
                              : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 relative ${
                          isEnabled 
                            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-md' 
                            : area.score === 0
                              ? 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-md'
                              : 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-md'
                        }`}>
                          <span className="filter drop-shadow-sm">{getAreaIcon(area.areaName)}</span>
                          {!isEnabled && area.score === 0 && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {!isEnabled && area.score > 0 && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className={`text-xs sm:text-sm font-semibold truncate ${
                              isEnabled 
                                ? 'text-green-900' 
                                : area.score === 0 
                                  ? 'text-amber-900' 
                                  : 'text-gray-700'
                            }`}>
                              {t(getAreaTranslationKey(area.areaName))}
                            </p>
                            {isEnabled && (
                              <span className="text-xs text-green-700">✓</span>
                            )}
                          </div>
                          <p className={`text-lg sm:text-xl font-bold ${
                            isEnabled 
                              ? 'text-green-700' 
                              : area.score === 0 
                                ? 'text-amber-700' 
                                : 'text-gray-700'
                          }`}>
                            {area.score === 0 ? '—' : `${area.score}/10`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Navegación inferior */}
      <BottomNav />
    </div>
  );
};

