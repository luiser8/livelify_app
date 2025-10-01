interface CarouselDotsProps {
  total: number;
  current: number;
  onDotClick?: (index: number) => void;
}

/**
 * Componente de indicadores de carousel
 */
export const CarouselDots = ({ total, current, onDotClick }: CarouselDotsProps) => {
  return (
    <div className="flex gap-2 justify-center items-center">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick?.(index)}
          className={`h-1 rounded-full transition-all duration-300 ${
            index === current 
              ? 'bg-white w-8' 
              : 'bg-white/30 w-1 hover:bg-white/50'
          }`}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === current ? 'true' : 'false'}
        />
      ))}
    </div>
  );
};

