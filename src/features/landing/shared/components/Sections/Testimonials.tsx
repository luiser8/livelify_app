const testimonials = [
  {
    name: 'María González',
    role: 'Emprendedora',
    avatar: '👩‍💼',
    quote: 'Livelify me ayudó a encontrar el equilibrio que tanto buscaba. En 3 meses logré mejorar mi salud y mi negocio al mismo tiempo.',
    rating: 5,
  },
  {
    name: 'Carlos Ramírez',
    role: 'Desarrollador de Software',
    avatar: '👨‍💻',
    quote: 'La Rueda de la Vida fue un eye-opener. Ahora tengo claridad sobre qué áreas necesito trabajar y un plan concreto para hacerlo.',
    rating: 5,
  },
  {
    name: 'Ana Martínez',
    role: 'Coach Personal',
    avatar: '👩‍🏫',
    quote: 'Como coach, recomiendo Livelify a todos mis clientes. Es la herramienta perfecta para mantener el seguimiento de su progreso.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <>
      {/* Decorative gradient divider top */}
      <div className="w-full h-12 sm:h-16 bg-gradient-to-b from-white via-purple-50/30 to-white"></div>

      <section id="testimonials" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-white relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-purple-50/30 to-pink-50/40 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
            <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-50 to-orange-50 text-orange-600 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-orange-100">
              ⭐ Casos de éxito
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Lo que dicen nuestros{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">usuarios</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              Miles de personas ya están transformando sus vidas con Livelify
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 relative shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                {/* Quote Icon */}
                <div className="text-indigo-600 mb-3 sm:mb-4">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Quote */}
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  {testimonial.quote}
                </p>

                {/* Rating */}
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg sm:text-xl">★</span>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1 sm:mb-2">2,500+</div>
              <p className="text-sm sm:text-base text-gray-600">Usuarios activos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1 sm:mb-2">4.8/5</div>
              <p className="text-sm sm:text-base text-gray-600">Valoración promedio</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600 mb-1 sm:mb-2">10,000+</div>
              <p className="text-sm sm:text-base text-gray-600">Objetivos cumplidos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mb-1 sm:mb-2">95%</div>
              <p className="text-sm sm:text-base text-gray-600">Recomendarían Livelify</p>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative gradient divider bottom */}
      <div className="w-full h-12 sm:h-16 bg-gradient-to-b from-white via-indigo-50/30 to-gray-50"></div>
    </>
  );
}
