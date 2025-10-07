import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lifeWheelService, type LifeWheelResponse } from '@/infrastructure/services';
import { getAreaColor, getAreaIcon, getAreaTranslationKey } from '@/shared/utils/lifeAreaHelpers';
import { BottomNav, PageHeader } from '@/shared/components';

/**
 * Página de introducción al Life Wheel Assessment
 */
export const AssessmentIntroPage = () => {
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
    // TODO: Navegar a la página de preguntas del assessment
    console.log('Starting assessment...');
  };

  const handleAreaClick = (areaId: string, hasScore: boolean) => {
    // Si el área ya tiene score, no permitir responder de nuevo
    if (hasScore) {
      return;
    }
    navigate(`/assessment/area/${areaId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <PageHeader 
        title="Assessment"
        subtitle="Life Wheel Assessment"
        backPath="/home"
        showSearch={false}
        showFilter={false}
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6">
        {/* Icono y título */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Life Wheel Assessment</h1>
          <p className="text-base sm:text-lg text-gray-600">
            60 Questions. 10 Minutes. Your Starting Point.
          </p>
        </div>

        {/* Advertencia permanente */}
        <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-red-900 mb-1">
                This assessment is permanent and cannot be retaken
              </h3>
              <p className="text-sm sm:text-base text-red-800">
                Your results become your baseline for all future transformations.
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje motivacional */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-semibold text-base sm:text-lg text-gray-900 mb-2 sm:mb-3">
            Answer honestly - this is just your baseline. You'll improve from here.
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            This assessment creates your starting point across 6 life areas. There are no wrong answers - 
            we're measuring where you are now, not where you should be. Your transformation journey begins 
            with this honest snapshot.
          </p>
        </div>

        {/* 6 Life Areas */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-6">6 Life Areas You'll Assess</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Loading areas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {lifeWheel?.lifeAreas.map((area) => {
                const hasScore = area.score > 0;
                const isCompleted = hasScore;
                
                return (
                  <button
                    key={area.id}
                    onClick={() => handleAreaClick(area.areaId, hasScore)}
                    disabled={isCompleted}
                    className={`bg-white border rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all text-left relative ${
                      isCompleted 
                        ? 'border-green-300 bg-green-50 cursor-not-allowed opacity-75' 
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
                    
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getAreaColor(area.areaName)} rounded-lg flex items-center justify-center text-2xl sm:text-3xl mb-2 sm:mb-3 ${isCompleted ? 'opacity-60' : ''}`}>
                      {getAreaIcon(area.areaName)}
                    </div>
                    <p className={`text-sm sm:text-base font-medium ${isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                      {t(getAreaTranslationKey(area.areaName))}
                    </p>
                    <p className={`text-xs sm:text-sm mt-1 ${isCompleted ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                      {isCompleted ? `✓ Completado: ${area.score}/10` : `Puntaje actual: ${area.score}/10`}
                    </p>
                    <p className={`text-xs sm:text-sm mt-2 font-medium ${isCompleted ? 'text-gray-500' : 'text-primary-600'}`}>
                      {isCompleted ? 'Ya evaluado' : 'Click para evaluar →'}
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
              <h4 className="text-sm sm:text-base font-semibold text-purple-900">10 questions per area</h4>
              <p className="text-xs sm:text-sm text-purple-800">Simple YES/NO format for honest answers</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-green-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-green-900">Instant scoring</h4>
              <p className="text-xs sm:text-sm text-green-800">Each area gets a score from 0-10 based on your responses</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-pink-900">Identifies focus area</h4>
              <p className="text-xs sm:text-sm text-pink-800">Your lowest scoring area becomes your first transformation priority</p>
            </div>
          </div>
        </div>

        {/* Before you begin */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-6">Before you begin:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Be completely honest</h4>
                <p className="text-xs text-gray-600">Your authentic answers create the most effective transformation plan</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Think about recent months</h4>
                <p className="text-xs text-gray-600">Base answers on your last 3-6 months, not your best or worst days</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">No judgment zone</h4>
                <p className="text-xs text-gray-600">Low scores aren't failures - they're opportunities for growth</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">This is your starting line</h4>
                <p className="text-xs text-gray-600">Every transformation journey needs a clear beginning point</p>
              </div>
            </div>
          </div>
        </div>

        {/* What happens after */}
        <div className="mb-6 sm:mb-8">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-4 sm:mb-6">What happens after assessment:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Your personalized Life Wheel is generated</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">We identify your priority area for transformation</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">You can create your first 90-day Oonograma</p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">4</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">Your daily transformation journey begins</p>
            </div>
          </div>
        </div>

        {/* Time investment */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⏱️</div>
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">Time Investment</h4>
              <p className="text-sm text-yellow-800">
                Most people complete this assessment in 8-12 minutes. Take your time - there's no rush.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de inicio */}
        <button
          onClick={handleStartAssessment}
          className="w-full py-4 sm:py-5 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl sm:rounded-2xl transition-all shadow-lg text-base sm:text-lg"
        >
          I'm Ready to Begin
        </button>

        {/* Advertencia final */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">You cannot go back once started</p>
          </div>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            This assessment is designed to capture an honest moment in time. 
            When you begin, commit to completing it and move forward. 
            You&#39;ll be able to retake or reassess past this first baseline.
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <button className="hover:text-purple-600">Assessment</button>
            <span>•</span>
            <button className="hover:text-purple-600">Question Bank</button>
            <span>•</span>
            <button className="hover:text-purple-600">Results</button>
            <span>•</span>
            <button className="hover:text-purple-600">Dashboard</button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">Need Refresh?</p>
        </div>

        {/* Pagination dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

