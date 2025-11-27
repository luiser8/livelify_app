import { Suspense } from 'react';
import { AppRouter } from './routes';

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <AppRouter />
    </Suspense>
  );
}

export default App;
