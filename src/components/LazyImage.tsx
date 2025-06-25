
import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const LazyImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop',
  onError,
  onLoad
}: LazyImageProps) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    if (!hasError && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false); // Reset error state to try fallback
    }
    onError?.(e);
  };

  return (
    <div ref={targetRef} className={`relative ${className}`}>
      {!isIntersecting && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      
      {isIntersecting && (
        <>
          {!isLoaded && (
            <Skeleton className="w-full h-full absolute inset-0" />
          )}
          <img
            src={currentSrc}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
};

export default LazyImage;
