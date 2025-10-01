import { useState, useEffect, useCallback } from 'react';

interface UseCarouselOptions {
  totalSlides: number;
  autoPlayInterval?: number;
  loop?: boolean;
}

/**
 * Hook personalizado para manejar la lógica del carousel
 */
export const useCarousel = ({
  totalSlides,
  autoPlayInterval = 5000,
  loop = true,
}: UseCarouselOptions) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev === totalSlides - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [totalSlides, loop]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        return loop ? totalSlides - 1 : prev;
      }
      return prev - 1;
    });
  }, [totalSlides, loop]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentSlide(index);
    }
  }, [totalSlides]);

  // Auto-play
  useEffect(() => {
    if (!autoPlayInterval || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlayInterval, isPaused, nextSlide]);

  return {
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide,
    isPaused,
    setIsPaused,
  };
};

