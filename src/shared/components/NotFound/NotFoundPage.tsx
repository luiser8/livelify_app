import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página 404 - Not Found
 */
export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Ilustración 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <div className="text-6xl mb-6">🔍</div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="py-3 px-6 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              ← Go Back
            </button>
            <button
              onClick={() => navigate('/app')}
              className="py-3 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg"
            >
              🏠 Go to Home
            </button>
          </div>

          {/* Enlaces útiles */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Helpful links:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/app/dashboard')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/app/projects')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
              >
                Projects
              </button>
              <button
                onClick={() => navigate('/app/actions')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
              >
                Actions
              </button>
              <button
                onClick={() => navigate('/app/profile')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
              >
                Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

