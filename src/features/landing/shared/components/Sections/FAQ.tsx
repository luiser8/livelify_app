import { useState } from 'react';

const faqs = [
  {
    question: "¿Qué es Livelify?",
    answer: `Livelify es una plataforma digital de transformación personal que te ayuda a evaluar, medir y mejorar todas las áreas importantes de tu vida. Con la Rueda de la Vida y otras herramientas, puedes visualizar tu balance actual y establecer un plan claro para alcanzar tus objetivos.`
  },
  {
    question: "¿Es gratuita la app?",
    answer: `Sí, Livelify ofrece una versión gratuita que incluye tu primera evaluación de la Rueda de la Vida, seguimiento básico de progreso y acceso a contenido educativo. También tenemos planes premium con funciones avanzadas para quienes buscan una experiencia más completa.`
  },
  {
    question: "¿Cómo funciona la Rueda de la Vida?",
    answer: `La Rueda de la Vida es una herramienta de evaluación que mide 8 áreas fundamentales: Salud, Carrera, Finanzas, Relaciones, Familia, Desarrollo Mental, Desarrollo Físico y Desarrollo Espiritual. Respondes preguntas específicas sobre cada área y obtienes una visualización gráfica que muestra tu nivel de satisfacción en cada una.`
  },
  {
    question: "¿Mis datos están seguros?",
    answer: `Absolutamente. La privacidad y seguridad de tus datos es nuestra máxima prioridad. Toda tu información personal está encriptada y solo tú tienes acceso a tus evaluaciones y resultados. No compartimos ni vendemos tus datos a terceros.`
  },
  {
    question: "¿Cada cuánto debo hacer la evaluación?",
    answer: `Recomendamos hacer una evaluación completa cada mes o cada trimestre, dependiendo de tus objetivos. Esto te permite ver tu progreso de forma tangible y ajustar tus estrategias según sea necesario.`
  },
  {
    question: "¿Puedo usar Livelify en diferentes dispositivos?",
    answer: `Sí, Livelify está disponible en web y pronto tendremos apps nativas para iOS y Android. Tu cuenta se sincroniza automáticamente en todos tus dispositivos.`
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Preguntas{' '}
            <span className="text-indigo-600">Frecuentes</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            Todo lo que necesitas saber sobre Livelify
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold text-base sm:text-lg text-gray-900 pr-2">
                  {faq.question}
                </h3>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 sm:px-6 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">¿Tienes más preguntas?</p>
          <a
            href="https://wa.me/56944303581?text=Hola%20Ifrain%2C%20tengo%20una%20consulta%20sobre%20el%20M%C3%A9todo%20Libre"
            target="_blank"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold text-sm sm:text-base"
          >
            Habla con nosotros
          </a>
        </div>
      </div>
    </section>
  );
}
