import { useState, useEffect } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <>
      {/* Sticky Navigation */}
      <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto px-4 lg:px-8 py-1 lg:py-1.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <a href="/" className="flex items-center gap-2 sm:gap-3">
              <img
                src="/logo.svg"
                alt="Livelify Logo"
                className="h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36 -my-4 lg:-my-6"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-6 2xl:space-x-8">
            <a href="#features" className="text-base 2xl:text-lg text-gray-700 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
              Plataforma
            </a>
            <a href="#how-it-works" className="text-base 2xl:text-lg text-gray-700 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
              ¿Cómo funciona?
            </a>
            <a href="#testimonials" className="text-base 2xl:text-lg text-gray-700 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
              Casos de éxito
            </a>
            <a href="#faq" className="text-base 2xl:text-lg text-gray-700 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
              Recursos
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden xl:flex items-center space-x-3 2xl:space-x-4 shrink-0">
            {isAuthenticated ? (
              // Si está autenticado, mostrar botón para volver al app
              <a
                href="/app"
                target="_self"
                rel="noopener noreferrer"
                className="px-5 2xl:px-6 py-2.5 2xl:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm text-base 2xl:text-lg whitespace-nowrap flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al App
              </a>
            ) : (
              // Si NO está autenticado, mostrar botón de iniciar sesión
              <a
                href="/app/login"
                target="_self"
                rel="noopener noreferrer"
                className="px-5 2xl:px-6 py-2.5 2xl:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm text-base 2xl:text-lg whitespace-nowrap"
              >
                Iniciar sesión
              </a>
            )}
            <a
              href="https://wa.me/56944303581?text=Hola%20Ifrain%2C%20tengo%20una%20consulta%20sobre%20el%20M%C3%A9todo%20Libre"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 2xl:px-6 py-2.5 2xl:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-sm text-base 2xl:text-lg whitespace-nowrap"
            >
              Habla con nosotros
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="xl:hidden text-gray-700 flex-shrink-0"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="xl:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Plataforma
              </a>
              <a href="#how-it-works" className="block text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                ¿Cómo funciona?
              </a>
              <a href="#testimonials" className="block text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Casos de éxito
              </a>
              <a href="#faq" className="block text-gray-700 hover:text-indigo-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                Recursos
              </a>
              {isAuthenticated ? (
                // Si está autenticado, mostrar botón para volver al app
                <a
                  href="/app"
                  target="_self"
                  rel="noopener noreferrer"
                  className="block px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Volver al App
                </a>
              ) : (
                // Si NO está autenticado, mostrar botón de iniciar sesión
                <a
                  href="/app/login"
                  target="_self"
                  rel="noopener noreferrer"
                  className="block px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-center"
                >
                  Iniciar sesión
                </a>
              )}
              <a
                href="https://wa.me/56944303581?text=Hola%20Ifrain%2C%20tengo%20una%20consulta%20sobre%20el%20M%C3%A9todo%20Libre"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Habla con nosotros
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-indigo-100">
              ✨ Más que una app, un plan de vida integral
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Transforma tu vida con{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Livelify</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 leading-relaxed">
              Descubre cómo el desarrollo personal va más allá de objetivos: entrega bienestar, hábitos preventivos y acompañamiento continuo, todo desde una sola app.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href="https://wa.me/56944303581?text=Hola%20Ifrain%2C%20tengo%20una%20consulta%20sobre%20el%20M%C3%A9todo%20Libre"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold text-center shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Habla con nosotros
              </a>
              <a
                href="#features"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-all font-semibold text-center text-sm sm:text-base"
              >
                Descubre la plataforma
              </a>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">Gratis para comenzar</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">100% seguro</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">Acceso inmediato</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mt-8 md:mt-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Decorative blur effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-20 blur-3xl"></div>
              
              {/* Placeholder for hero image */}
              <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 aspect-square rounded-2xl flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <div className="text-6xl sm:text-8xl md:text-9xl mb-2 sm:mb-4">🎯</div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Rueda de la Vida</p>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="hidden lg:block absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 max-w-xs border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transformando vidas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
