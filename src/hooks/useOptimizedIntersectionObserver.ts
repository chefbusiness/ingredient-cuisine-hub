
import { useEffect, useRef, useState } from 'react';

interface UseOptimizedIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
  animationDelay?: number;
}

export const useOptimizedIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  skip = false,
  animationDelay = 0
}: UseOptimizedIntersectionObserverOptions = {}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (skip || !targetRef.current) return;

    const target = targetRef.current;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        
        if (isVisible && !hasAnimated) {
          if (animationDelay > 0) {
            setTimeout(() => {
              setIsIntersecting(true);
              setHasAnimated(true);
            }, animationDelay);
          } else {
            setIsIntersecting(true);
            setHasAnimated(true);
          }

          if (triggerOnce && observerRef.current) {
            observerRef.current.unobserve(target);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(isVisible);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, triggerOnce, skip, animationDelay, hasAnimated]);

  return { targetRef, isIntersecting, hasAnimated };
};
