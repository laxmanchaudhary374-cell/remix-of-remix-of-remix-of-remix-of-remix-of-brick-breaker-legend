import { useCallback, useEffect, useRef } from 'react';

const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms

export const useGameLoop = (callback: (deltaTime: number) => void, isRunning: boolean) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const accumulatorRef = useRef<number>(0);
  const smoothDeltaRef = useRef<number>(FRAME_TIME);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const elapsed = Math.min(time - previousTimeRef.current, 100);
      accumulatorRef.current += elapsed;

      if (accumulatorRef.current >= FRAME_TIME) {
        // Smooth the frame time to remove jitter from irregular rAF timing
        smoothDeltaRef.current = smoothDeltaRef.current * 0.8 + accumulatorRef.current * 0.2;
        const deltaTime = Math.min(smoothDeltaRef.current / 1000, 0.05);
        // Keep the leftover time instead of dropping it (prevents stutter)
        accumulatorRef.current = Math.min(accumulatorRef.current - FRAME_TIME, FRAME_TIME);
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
