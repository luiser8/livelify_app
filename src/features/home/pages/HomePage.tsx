import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BottomNav, PageHeader } from '@/shared/components';
import { LifeWheelHexagon } from '../components';
import { lifeWheelService, type LifeWheelResponse } from '@/infrastructure/services';
import { getAreaIcon } from '@/shared/utils/lifeAreaHelpers';

/**
 * Página principal - Life Wheel
 */
export const HomePage = () => {
  const navigate = useNavigate();
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
        title="Life Wheel"
        subtitle="Your transformation journey"
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
            <p className="text-gray-500 mt-4 text-sm sm:text-base">Loading your Life Wheel...</p>
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
        <div className="max-w-2xl mx-auto w-full pt-4">
          {/* Botón de acción - Solo mostrar si no todas las áreas están respondidas */}
          {!allAreasAnswered && (
            <>
              <button
                onClick={handleStartAssessment}
                className="w-full py-4 sm:py-5 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl sm:rounded-2xl transition-all shadow-lg text-base sm:text-lg"
              >
                Start Assessment Now
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
                    <span className="font-semibold">Once configured, your wheel cannot be reset.</span> You'll improve it through transformations.
                  </p>
                </div>
              </div>

              {/* Texto informativo */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
                  Most people start with scores between <span className="font-semibold text-gray-900">4-6</span> in each area. 
                  The assessment takes about <span className="font-semibold text-gray-900">10 minutes</span> and creates your personal baseline for transformation.
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
                      <p className="text-sm font-semibold text-blue-900 mb-1">Partial Assessment Completed</p>
                      <p className="text-xs sm:text-sm text-blue-800">
                        You can manage projects for evaluated areas (✓). Complete the assessment for all areas to unlock full project creation.
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
                    <h3 className="text-lg font-bold text-green-900 mb-2">Assessment Completed!</h3>
                    <p className="text-sm sm:text-base text-green-800 leading-relaxed">
                      Your Life Wheel is configured. Click on any area to view and manage your projects, or explore your dashboard to track your progress.
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
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Focus on Your Lowest Areas</h4>
                    <p className="text-xs sm:text-sm text-blue-800">
                      You can only create projects in your <span className="font-bold">3 lowest scoring areas</span>. This helps you focus on what needs the most improvement. Other areas are locked 🔒 until you improve these first.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Scores Summary - Solo si hay scores */}
          {hasScores && lifeWheel && (
            <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Your Current Scores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {lifeWheel.lifeAreas
                  .sort((a, b) => a.score - b.score) // Ordenar por score ascendente
                  .map((area) => {
                    const isEnabled = enabledAreaIds.has(area.id);
                    return (
                      <div 
                        key={area.id} 
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all ${
                          isEnabled 
                            ? 'bg-green-50 border-2 border-green-200' 
                            : area.score === 0
                              ? 'bg-amber-50 border border-amber-200 opacity-70'
                              : 'bg-red-50 border border-red-200 opacity-60'
                        }`}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0 relative`}>
                          {getAreaIcon(area.areaName)}
                          {!isEnabled && area.score === 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                          {!isEnabled && area.score > 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className={`text-xs sm:text-sm truncate ${isEnabled ? 'text-green-900 font-medium' : 'text-gray-600'}`}>
                              {area.areaName}
                            </p>
                            {isEnabled && (
                              <span className="text-xs">✓</span>
                            )}
                          </div>
                          <p className={`text-base sm:text-lg font-bold ${isEnabled ? 'text-green-700' : area.score === 0 ? 'text-amber-700' : 'text-red-600'}`}>
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

