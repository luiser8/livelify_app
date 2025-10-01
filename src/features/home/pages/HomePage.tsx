import { Button } from '../../../shared/components';

/**
 * Página principal de la aplicación
 */
export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl font-bold">Livelify</span>
          </a>
          <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
            <a className="mr-5 hover:text-gray-900 cursor-pointer">Inicio</a>
            <a className="mr-5 hover:text-gray-900 cursor-pointer">Características</a>
            <a className="mr-5 hover:text-gray-900 cursor-pointer">Precios</a>
            <a className="mr-5 hover:text-gray-900 cursor-pointer">Contacto</a>
          </nav>
          <Button variant="primary" size="md">
            Comenzar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-5 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bienvenido a Livelify
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Una aplicación web moderna construida con arquitectura limpia, 
            React, TypeScript y Tailwind CSS.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" size="lg">
              Empezar ahora
            </Button>
            <Button variant="outline" size="lg">
              Ver demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Rápido</h3>
            <p className="text-gray-600">
              Optimizado para rendimiento y velocidad de carga.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Modular</h3>
            <p className="text-gray-600">
              Arquitectura limpia y escalable para crecer con tu proyecto.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Seguro</h3>
            <p className="text-gray-600">
              Construido con las mejores prácticas de seguridad.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

