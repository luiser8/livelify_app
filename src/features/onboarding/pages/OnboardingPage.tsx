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
      navigate('/app/home');
    } else {
      navigate('/app/login');
    }
  };

  const handleLogin = () => {
    navigate('/app/login');
  };

  const handleRegister = () => {
    navigate('/app/register');
  };

  const handleLogout = () => {
    logout();
    // Opcional: mostrar mensaje de confirmación
  };

  return (
    <div
      className="min-h-screen gradient-livelify flex flex-col items-center justify-between px-4 sm:px-6 py-4 sm:py-8 text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header - muestra diferentes opciones según autenticación */}
      <div className="w-full max-w-6xl">
        {isAuthenticated ? (
          // Si está autenticado, mostrar info del usuario y logout
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="text-white/90 text-xs sm:text-sm truncate max-w-full">
              {t('onboarding.welcome')}, <span className="font-semibold">{user?.firstName}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <LanguageSelector />
              <button
                onClick={handleLogout}
                className="text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('onboarding.logout')}
              </button>
            </div>
          </div>
        ) : (
          // Si NO está autenticado, mostrar botones de login/register
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 items-center sm:items-center">
            <div className="flex items-center justify-end w-full sm:w-auto">
              <LanguageSelector />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                onClick={handleLogin}
                className="text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium text-center whitespace-nowrap"
              >
                {t('onboarding.haveAccount')}
              </button>
              <button
                onClick={handleRegister}
                className="text-white/90 hover:text-white transition-colors text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 border border-white/30 rounded-lg hover:bg-white/10 text-center whitespace-nowrap"
              >
                {t('onboarding.signUp')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center space-y-2 sm:space-y-3 py-2 sm:py-4">
        {/* Logo */}
        <div className="flex justify-center -mb-16 sm:-mb-20 md:-mb-24 -mt-20 sm:-mt-24 md:-mt-28">
          <img
            src="/logo_white.svg"
            alt="Livelify"
            className="h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96 xl:h-[26rem] xl:w-[26rem]"
          />
        </div>

        {/* Logo text */}
        {/* <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-0">{t('onboarding.title')}</h1>
          <p className="text-sm sm:text-lg md:text-xl text-white/90 px-2">{t('onboarding.tagline')}</p>
        </div> */}

        {/* Contenido del slide actual con animación */}
        <div className="space-y-2 sm:space-y-3 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center px-2">
          <h2 
            key={`title-${currentSlide}`}
            className="text-3xl sm:text-3xl md:text-3xl lg:text-4xl font-bold leading-tight px-2 sm:px-4 animate-fade-in"
          >
            {slides[currentSlide].title}
          </h2>
          <p
            key={`subtitle-${currentSlide}`}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 animate-fade-in-delay px-2"
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
      <div className="w-full max-w-md space-y-3 sm:space-y-4">
        <button
          onClick={handleExplore}
          className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-cream text-primary-700 font-semibold rounded-xl hover:bg-cream-dark transition-all transform hover:scale-105 shadow-lg text-base sm:text-lg"
        >
          {isAuthenticated ? t('onboarding.goToApp') : t('onboarding.exploreApp')}
        </button>

        {/* Copyright */}
        <Copyright variant="dark"/>
      </div>
    </div>
  );
};

