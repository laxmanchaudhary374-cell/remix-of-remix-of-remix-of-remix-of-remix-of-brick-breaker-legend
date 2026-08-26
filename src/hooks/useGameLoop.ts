import { useEffect, useRef } from 'react';

export const useGameLoop = (callback: (deltaTime: number) => void, isRunning: boolean) => {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!isRunning) return;

    let raf = 0;
let prev: number | undefined;
let accumulator = 0;

const TARGET_FRAME_MS = 1000 / 60;

const animate = (time: number) => {
  raf = requestAnimationFrame(animate);

  if (prev === undefined) {
    prev = time;
    return;
  }

  const elapsed = Math.min(time - prev, 100);
  prev = time;
  accumulator += elapsed;

  if (accumulator < TARGET_FRAME_MS) return;

  // Run exactly one game update at a stable 60 FPS.
  // Discard excess time to prevent a CPU catch-up spike.
  accumulator = 0;
  cbRef.current(1 / 60);
};


    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [isRunning]);
};
