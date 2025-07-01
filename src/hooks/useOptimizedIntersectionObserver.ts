
import { useEffect, useRef, useState } from 'react';

interface UseOptimizedIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  skip?: boolean;
}

export const useOptimizedIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  skip = false
}: UseOptimizedIntersectionObserverOptions = {}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (skip || !targetRef.current) return;

    const target = targetRef.current;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);

        if (isVisible && triggerOnce && observerRef.current) {
          observerRef.current.unobserve(target);
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
  }, [threshold, rootMargin, triggerOnce, skip]);

  return { targetRef, isIntersecting };
};
