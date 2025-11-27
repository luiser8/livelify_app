const features = [
  {
    emoji: '🎯',
    title: 'Rueda de la Vida',
    description: 'Evalúa 8 áreas fundamentales: Salud, Finanzas, Carrera, Relaciones y más. Visualiza tu balance actual.',
  },
  {
    emoji: '📊',
    title: 'Seguimiento de Progreso',
    description: 'Mide tu evolución día a día con gráficos intuitivos y reportes detallados de tu crecimiento.',
  },
  {
    emoji: '🎓',
    title: 'Planes Personalizados',
    description: 'Crea objetivos inteligentes y recibe un plan de acción adaptado a tus necesidades específicas.',
  },
  {
    emoji: '💪',
    title: 'Hábitos Saludables',
    description: 'Desarrolla rutinas positivas con recordatorios y un sistema de seguimiento de hábitos diarios.',
  },
  {
    emoji: '🧘',
    title: 'Bienestar Mental',
    description: 'Accede a ejercicios de mindfulness, meditación y herramientas para reducir el estrés.',
  },
  {
    emoji: '📱',
    title: 'App Multiplataforma',
    description: 'Sincroniza tu progreso en todos tus dispositivos. Disponible en iOS, Android y web.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
      {/* Decorative gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh pointer-events-none"></div>
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-indigo-100 shadow-sm">
            ✨ Plataforma completa
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Todo lo que necesitas para{' '}
            <span className="text-gradient">transformarte</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Herramientas poderosas y fáciles de usar para llevar tu vida al siguiente nivel
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white/50 backdrop-blur-sm rounded-2xl p-5 sm:p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200"
            >
              {/* Gradient glow on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300"></div>
              
              <div className="relative">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">{feature.emoji}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
