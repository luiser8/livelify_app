import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BottomNav } from '@/shared/components';
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

  const handleBack = () => {
    navigate('/');
  };

  const handleAreaClick = (areaId: string) => {
    navigate(`/area/${areaId}/projects`);
  };

  const hasScores = lifeWheel?.lifeAreas && lifeWheel.lifeAreas.some(area => area.score > 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            />
          </div>
        )}

        {/* Contenedor para botón y mensajes */}
        <div className="max-w-2xl mx-auto w-full">
          {/* Botón de acción */}
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

          {/* Scores Summary - Solo si hay scores */}
          {hasScores && lifeWheel && (
            <div className="mt-8 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Your Current Scores</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {lifeWheel.lifeAreas.map((area) => (
                  <div key={area.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-lg sm:text-xl flex-shrink-0`}>
                      {getAreaIcon(area.areaName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{area.areaName}</p>
                      <p className="text-base sm:text-lg font-bold text-gray-900">{area.score}/10</p>
                    </div>
                  </div>
                ))}
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

