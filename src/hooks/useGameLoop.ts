import { useCallback, useEffect, useRef } from 'react';

const TARGET_FPS = 30;
const FRAME_TIME = 1000 / TARGET_FPS; // ~33.33ms

export const useGameLoop = (callback: (deltaTime: number) => void, isRunning: boolean) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const accumulatorRef = useRef<number>(0);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const elapsed = time - previousTimeRef.current;
      accumulatorRef.current += elapsed;
      
      // Only run game logic at 30fps to reduce CPU/heat
      if (accumulatorRef.current >= FRAME_TIME) {
        const deltaTime = Math.min(accumulatorRef.current / 1000, 0.1);
        accumulatorRef.current = 0;
        callback(deltaTime);
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    if (isRunning) {
      accumulatorRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      previousTimeRef.current = undefined;
      accumulatorRef.current = 0;
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, animate]);
};
