import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BottomNav } from '@/shared/components';
import { LifeWheelHexagon } from '../components';
import { lifeWheelService, type LifeWheelResponse } from '@/infrastructure/services';

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

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-lg font-semibold text-gray-900">Life Wheel</h1>

          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Hexágono del Life Wheel */}
        {loading ? (
          <div className="mb-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your Life Wheel...</p>
          </div>
        ) : (
          <div className="mb-8">
            <LifeWheelHexagon lifeAreas={lifeWheel?.lifeAreas || []} />
          </div>
        )}

        {/* Botón de acción */}
        <button
          onClick={handleStartAssessment}
          className="w-full max-w-sm py-4 px-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-all shadow-md"
        >
          Start Assessment Now
        </button>

        {/* Advertencia */}
        <div className="w-full max-w-sm mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-700">
              Once configured, your wheel cannot be reset. You'll improve it through transformations.
            </p>
          </div>
        </div>

        {/* Texto informativo */}
        <p className="text-center text-gray-600 text-sm mt-6 max-w-sm leading-relaxed">
          Most people start with scores between 4-6 in each area. The assessment takes about 10 minutes and creates your personal baseline for transformation.
        </p>
      </main>

      {/* Navegación inferior */}
      <BottomNav />
    </div>
  );
};

