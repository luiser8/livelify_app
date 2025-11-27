export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-700 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-6">
          {/* Plataforma */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h3 className="text-gray-900 font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Plataforma</h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a href="#features" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Características
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Beneficios
                </a>
              </li>
            </ul>
          </div>

          {/* Artículos destacados */}
          <div className="sm:col-span-1 lg:col-span-2">
            <h3 className="text-gray-900 font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Artículos destacados</h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Guía completa de la Rueda de la Vida
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Casos de éxito: Transformación real
                </a>
              </li>
            </ul>
          </div>

          {/* Sobre Livelify */}
          <div className="sm:col-span-1 lg:col-span-1">
            <h3 className="text-gray-900 font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Sobre Livelify</h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Nuestro manifiesto
                </a>
              </li>
              <li>
                <a href="#" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  El impacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="text-gray-900 font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Contacto</h3>
            <ul className="space-y-2 sm:space-y-2.5">
              <li>
                <a href="https://wa.me/56944303581?text=Hola%20Ifrain%2C%20tengo%20una%20consulta%20sobre%20el%20M%C3%A9todo%20Libre"
                target="_blank" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Habla con un experto
                </a>
              </li>
              <li>
                <a href="mailto:support@livelify.app" className="text-sm sm:text-base text-gray-600 hover:text-indigo-600 transition-colors font-medium break-all">
                  Acceso a soporte
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media Icons & Logo */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-row justify-between items-center gap-4 sm:gap-6">
            {/* Social Icons */}
            <div className="flex gap-2 sm:gap-3 lg:gap-4">
              <a 
                href="https://www.facebook.com/ifrain.medina/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 group shrink-0" 
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/ifraindmg/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 group shrink-0" 
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/in/ifraindavidmedinagarcia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 group shrink-0" 
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a 
                href="https://www.youtube.com/@ifraindmg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-indigo-600 hover:text-white transition-all duration-300 group shrink-0" 
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Logo */}
            <div className="flex items-center shrink-0">
              <img
                src="/logo.svg"
                alt="Livelify Logo"
                className="h-24 w-24 sm:h-28 sm:w-28 lg:h-36 lg:w-36"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-6">
            <p className="text-xs sm:text-sm text-gray-600 font-medium text-center lg:text-left order-2 lg:order-1">
              ©{currentYear} Livelify. Todos los derechos reservados.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-6 order-1 lg:order-2">
              <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
                Política de privacidad
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
                Política de Cookies
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium whitespace-nowrap">
                Términos y Condiciones
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
