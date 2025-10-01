import { useNavigate } from 'react-router-dom';
import { CarouselDots } from '../components';
import { useCarousel } from '../hooks';

/**
 * Datos de las diapositivas del onboarding
 */
const slides = [
  {
    title: 'Transform Your Life in 90 Days',
    subtitle: 'Stop surviving. Start thriving.',
  },
  {
    title: 'Discover Your Path to Wellness',
    subtitle: 'Personalized guidance for your journey.',
  },
  {
    title: 'Track Your Progress Daily',
    subtitle: 'Small steps lead to big changes.',
  },
  {
    title: 'Join a Thriving Community',
    subtitle: 'You\'re not alone in this journey.',
  },
];

/**
 * Página de Onboarding/Landing
 */
export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { currentSlide, goToSlide, setIsPaused } = useCarousel({
    totalSlides: slides.length,
    autoPlayInterval: 5000,
    loop: true,
  });

  const handleExplore = () => {
    // TODO: Navegar a la página principal o tour
    console.log('Explore the App');
  };

  const handleStartAssessment = () => {
    // TODO: Navegar a la página de assessment
    console.log('Start Assessment');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div
      className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-6 py-8 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header con botón de login */}
      <div className="w-full max-w-6xl flex justify-end">
        <button
          onClick={handleLogin}
          className="text-white/90 hover:text-white transition-colors text-sm font-medium"
        >
          I have an account
        </button>
      </div>
      <div className="w-full max-w-6xl flex justify-end">
      <button
          onClick={handleRegister}
          className="text-white/90 hover:text-white transition-colors text-sm font-medium"
        >
          I don't have an account, register
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C12 2 8 4 8 8C8 10 9 11 10 12C9 13 8 14 8 16C8 20 12 22 12 22C12 22 16 20 16 16C16 14 15 13 14 12C15 11 16 10 16 8C16 4 12 2 12 2Z" />
          </svg>
        </div>

        {/* Logo text */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold mb-2">Livelify</h1>
          <p className="text-lg md:text-xl text-white/90">From Surviving to Thriving</p>
        </div>

        {/* Contenido del slide actual con animación */}
        <div className="space-y-4 min-h-[200px] flex flex-col justify-center">
          <h2 
            key={`title-${currentSlide}`}
            className="text-3xl md:text-4xl font-bold leading-tight px-4 animate-fade-in"
          >
            {slides[currentSlide].title}
          </h2>
          <p
            key={`subtitle-${currentSlide}`}
            className="text-lg md:text-xl text-white/90 animate-fade-in-delay"
          >
            {slides[currentSlide].subtitle}
          </p>
        </div>

        {/* Indicadores de carousel */}
        <CarouselDots
          total={slides.length}
          current={currentSlide}
          onDotClick={goToSlide}
        />
      </div>

      {/* Botones de acción */}
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={handleExplore}
          className="w-full py-4 px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          Explore the App
        </button>

        <button
          onClick={handleStartAssessment}
          className="w-full py-4 px-6 bg-transparent border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all text-lg backdrop-blur-sm"
        >
          Start My Assessment
        </button>

        {/* Texto de social proof */}
        <p className="text-center text-white/80 text-sm mt-6">
          Join 10,000+ people transforming their lives
        </p>
      </div>
    </div>
  );
};

