const steps = [
  {
    number: '01',
    title: 'Crea tu cuenta',
    description: 'Regístrate gratis en menos de 30 segundos. Solo necesitas tu email para comenzar.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-600',
    lightGradient: 'from-blue-50 to-indigo-50',
  },
  {
    number: '02',
    title: 'Completa tu Rueda de la Vida',
    description: 'Evalúa 8 áreas clave de tu vida y descubre tu nivel de satisfacción actual.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-purple-600',
    lightGradient: 'from-indigo-50 to-purple-50',
  },
  {
    number: '03',
    title: 'Define tus objetivos',
    description: 'Establece metas SMART para cada área que quieras mejorar.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-600',
    lightGradient: 'from-purple-50 to-pink-50',
  },
  {
    number: '04',
    title: 'Sigue tu progreso',
    description: 'Monitorea tu evolución con dashboards intuitivos y reportes personalizados.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    gradient: 'from-pink-500 to-rose-600',
    lightGradient: 'from-pink-50 to-rose-50',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-purple-200/50">
              🚀 Proceso simple y efectivo
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              ¿Cómo funciona{' '}
              <span className="text-gradient-purple">Livelify?</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              En 4 pasos simples, comienza tu transformación personal
            </p>
          </div>

          {/* Steps - Desktop */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
            {/* Connection line with gradient */}
            <div className="absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -z-10 rounded-full hidden lg:block"></div>

            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step number circle with gradient - sin sombra */}
                <div className={`w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-4 lg:mb-6 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center font-bold text-lg lg:text-xl group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>

                {/* Icon with gradient background - sin sombra */}
                <div className={`w-14 h-14 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-xl bg-gradient-to-br ${step.lightGradient} flex items-center justify-center text-gray-700 group-hover:scale-105 transition-transform duration-300 border border-gray-100/50`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2 lg:mb-3 text-center px-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed text-sm px-2">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Steps - Mobile */}
          <div className="md:hidden space-y-5 sm:space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-3 sm:gap-4">
                {/* Left side - Number and line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0`}>
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-1 h-full bg-gradient-to-b ${step.gradient} mt-2 opacity-20 rounded-full`}></div>
                  )}
                </div>

                {/* Right side - Content */}
                <div className="flex-1 pb-2 sm:pb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br ${step.lightGradient} flex items-center justify-center text-gray-700 border border-gray-100/50`}>
                    {step.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
}
