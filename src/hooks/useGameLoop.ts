import { useEffect, useRef } from 'react';

export const useGameLoop = (
  callback: (deltaTime: number) => void,
  isRunning: boolean,
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!isRunning) return;

    let animationFrame = 0;
    let previousTime: number | undefined;
    let accumulatedTime = 0;
    const targetFrameMs = 1000 / 60;

    const animate = (time: number) => {
      animationFrame = requestAnimationFrame(animate);

      if (previousTime === undefined) {
        previousTime = time;
        return;
      }

      const elapsed = Math.min(time - previousTime, 100);
      previousTime = time;
      accumulatedTime += elapsed;

      if (accumulatedTime < targetFrameMs) return;

      // Prevent 90/120 Hz phones from running the complete game loop
      // more often than the game needs.
      accumulatedTime = 0;
      callbackRef.current(1 / 60);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isRunning]);
};
