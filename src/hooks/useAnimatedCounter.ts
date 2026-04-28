import { useEffect, useRef, useState } from 'react';

export function useAnimatedCounter(target: number, duration = 1500, shouldStart = false) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!shouldStart) return;
    const startTime = performance.now();
    const easing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easing(progress) * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    }

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, shouldStart]);

  return count;
}
