import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CarouselDots } from '../components';
import { useCarousel } from '../hooks';
import { useAuth } from '@/features/auth/context';
import { LanguageSelector, Copyright } from '@/shared/components';

/**
 * Página de Onboarding/Landing
 */
export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, logout, user } = useAuth();

  // Slides dinámicos desde traducciones
  const slides = [
    {
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
    },
    {
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
    },
    {
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
    },
    {
      title: t('onboarding.slide4.title'),
      subtitle: t('onboarding.slide4.subtitle'),
    },
  ];
  
  const { currentSlide, goToSlide, setIsPaused } = useCarousel({
    totalSlides: slides.length,
    autoPlayInterval: 5000,
    loop: true,
  });

  const handleExplore = () => {
    // Si está autenticado, va al home, sino al login
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogout = () => {
    logout();
    // Opcional: mostrar mensaje de confirmación
  };

  return (
    <div
      className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-6 py-8 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header - muestra diferentes opciones según autenticación */}
      <div className="w-full max-w-6xl">
        {isAuthenticated ? (
          // Si está autenticado, mostrar info del usuario y logout
          <div className="flex justify-between items-center">
            <div className="text-white/90 text-sm">
              {t('onboarding.welcome')}, <span className="font-semibold">{user?.firstName}</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="text-white/90 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('onboarding.logout')}
              </button>
            </div>
          </div>
        ) : (
          // Si NO está autenticado, mostrar botones de login/register
          <div className="flex justify-end gap-4">
            <LanguageSelector />
            <button
              onClick={handleLogin}
              className="text-white/90 hover:text-white transition-colors text-sm font-medium"
            >
              {t('onboarding.haveAccount')}
            </button>
            <button
              onClick={handleRegister}
              className="text-white/90 hover:text-white transition-colors text-sm font-medium px-4 py-2 border border-white/30 rounded-lg hover:bg-white/10"
            >
              {t('onboarding.signUp')}
            </button>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
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
          <h1 className="text-5xl md:text-5xl font-bold mb-0">{t('onboarding.title')}</h1>
          <p className="text-lg md:text-xl text-white/90">{t('onboarding.tagline')}</p>
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

      {/* Botones de acción y Footer */}
      <div className="w-full max-w-md space-y-8">
        <button
          onClick={handleExplore}
          className="w-full py-4 px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          {isAuthenticated ? t('onboarding.goToApp') : t('onboarding.exploreApp')}
        </button>

        {/* Copyright */}
        <Copyright variant="dark"/>
      </div>
    </div>
  );
};

