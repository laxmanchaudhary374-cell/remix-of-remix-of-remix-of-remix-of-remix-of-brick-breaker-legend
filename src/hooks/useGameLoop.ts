import { useEffect, useRef } from 'react';

export const useGameLoop = (callback: (deltaTime: number) => void, isRunning: boolean) => {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!isRunning) return;

    let raf = 0;
    let prev: number | undefined;

    const animate = (time: number) => {
      if (prev !== undefined) {
        const deltaTime = Math.min((time - prev) / 1000, 0.05);
        cbRef.current(deltaTime);
      }
      prev = time;
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isRunning]);
};
