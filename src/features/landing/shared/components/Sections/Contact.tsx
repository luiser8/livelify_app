export function Contact() {
  return (
    <section id="contact" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4">
            ¿Listo para transformar tu vida?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
            Únete a miles de personas que ya están alcanzando sus objetivos y viviendo la vida que siempre soñaron.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 sm:mb-12 px-4">
            <a
              href="/app"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
            >
              Comenzar ahora
            </a>
            <a
              href="https://wa.me/56944303581?text=Hola%20Ifrain%2C%20tengo%20una%20consulta%20sobre%20el%20M%C3%A9todo%20Libre"
              target="_blank"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg hover:bg-white/20 transition-all font-semibold text-base sm:text-lg"
            >
              Habla con nosotros
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-indigo-100 px-4">
            <a href="mailto:support@livelify.app" className="flex items-center gap-2 hover:text-white transition-colors text-sm sm:text-base">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="break-all sm:break-normal">support@livelify.app</span>
            </a>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Respuesta en menos de 24h
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

