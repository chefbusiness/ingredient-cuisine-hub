
import { useState, memo } from 'react';
import { useOptimizedIntersectionObserver } from '@/hooks/useOptimizedIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  animationDelay?: number;
}

const LazyImage = memo(({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
  onError,
  onLoad,
  animationDelay = 0
}: LazyImageProps) => {
  const { targetRef, isIntersecting, hasAnimated } = useOptimizedIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true,
    animationDelay
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      setHasError(true);
    }
    onError?.(e);
  };

  return (
    <div 
      ref={targetRef} 
      className={`relative overflow-hidden group ${className}`}
    >
      {/* Skeleton con animación de salida */}
      <Skeleton 
        className={`w-full h-full absolute inset-0 transition-all duration-500 ${
          isLoaded && hasAnimated 
            ? 'opacity-0 scale-95 pointer-events-none' 
            : 'opacity-100 scale-100'
        }`} 
      />
      
      {isIntersecting && (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-700 ease-out transform ${
            isLoaded && hasAnimated
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-105'
          } group-hover:scale-110`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
      
      {/* Overlay sutil en hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 pointer-events-none" />
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
