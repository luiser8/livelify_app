export function Benefits() {
  return (
    <>
      {/* Decorative gradient divider top */}
      <div className="w-full h-12 sm:h-16 bg-gradient-to-b from-white via-purple-50/30 to-gray-50"></div>

      <section id="benefits" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          {/* Benefit 1 - Image on Right */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center mb-16 sm:mb-20 md:mb-24">
            <div>
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-indigo-100">
                📊 Visualización intuitiva
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Visualiza tu progreso en{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">tiempo real</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Con la Rueda de la Vida, obtén una visión completa y clara de tu bienestar en 8 áreas clave. Identifica rápidamente dónde necesitas enfocarte y celebra tus logros.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Evaluación en 8 dimensiones</p>
                    <p className="text-xs sm:text-sm text-gray-600">Salud, Carrera, Finanzas, Relaciones y más</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Gráficos intuitivos</p>
                    <p className="text-xs sm:text-sm text-gray-600">Visualiza tu balance de forma clara y sencilla</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Seguimiento histórico</p>
                    <p className="text-xs sm:text-sm text-gray-600">Ve tu evolución a lo largo del tiempo</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="order-first md:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 aspect-square flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <div className="text-6xl sm:text-8xl md:text-9xl mb-2 sm:mb-4">📊</div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Dashboard de Progreso</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefit 2 - Image on Left */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center mb-16 sm:mb-20 md:mb-24">
            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 aspect-square flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <div className="text-6xl sm:text-8xl md:text-9xl mb-2 sm:mb-4">🎯</div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Objetivos Inteligentes</p>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-purple-100">
                🎯 Metas SMART
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Crea objetivos que{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">realmente cumplirás</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Define metas claras y alcanzables con nuestro sistema SMART. Cada objetivo viene con un plan de acción personalizado que te guía paso a paso.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Objetivos SMART</p>
                    <p className="text-xs sm:text-sm text-gray-600">Específicos, Medibles, Alcanzables, Relevantes y con Tiempo</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Recordatorios inteligentes</p>
                    <p className="text-xs sm:text-sm text-gray-600">Mantente enfocado con notificaciones personalizadas</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Celebra tus logros</p>
                    <p className="text-xs sm:text-sm text-gray-600">Sistema de recompensas que te mantiene motivado</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Benefit 3 - Image on Right */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-emerald-100">
                💪 Hábitos consistentes
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Desarrolla hábitos{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">que duran</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Construye rutinas saludables que se convierten en parte de tu vida. Con nuestro sistema de seguimiento de hábitos, el cambio positivo se vuelve automático.
              </p>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Seguimiento diario</p>
                    <p className="text-xs sm:text-sm text-gray-600">Marca tus hábitos completados cada día</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Rachas motivadoras</p>
                    <p className="text-xs sm:text-sm text-gray-600">Mantén tu racha y desafíate a mejorar</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mt-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium">Análisis de patrones</p>
                    <p className="text-xs sm:text-sm text-gray-600">Identifica qué funciona mejor para ti</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="order-first md:order-last">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 aspect-square flex items-center justify-center">
                <div className="text-center p-6 sm:p-8">
                  <div className="text-6xl sm:text-8xl md:text-9xl mb-2 sm:mb-4">💪</div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Tracker de Hábitos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative gradient divider bottom */}
      <div className="w-full h-12 sm:h-16 bg-gradient-to-b from-gray-50 via-indigo-50/30 to-white"></div>
    </>
  );
}
