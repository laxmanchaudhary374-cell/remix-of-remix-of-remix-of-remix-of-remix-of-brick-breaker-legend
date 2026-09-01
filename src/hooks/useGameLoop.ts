import { useEffect, useRef } from 'react';

/**
 * Fixed-timestep game loop.
 * - Simulates in exact 1/60s steps so physics is identical on 60/90/120 Hz phones.
 * - Keeps leftover accumulator time (no drift / micro-stutter).
 * - Max 5 catch-up steps per frame, excess stale time is discarded (no CPU spike).
 * - Pauses while the tab/app is hidden and resets timing on resume, so a
 *   WhatsApp notification or app switch never produces a huge delta jump.
 */
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
    const STEP_MS = 1000 / 60;
    const STEP_S = 1 / 60;
    const MAX_STEPS = 5;

    const onVisibility = () => {
      // Drop everything buffered while hidden; restart timing cleanly.
      previousTime = undefined;
      accumulatedTime = 0;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const animate = (time: number) => {
      animationFrame = requestAnimationFrame(animate);

      if (document.hidden) {
        previousTime = undefined;
        accumulatedTime = 0;
        return;
      }

      if (previousTime === undefined) {
        previousTime = time;
        return;
      }

      const elapsed = time - previousTime;
      previousTime = time;

      // Ignore absurd gaps (resume from background, GC pause, etc.)
      accumulatedTime += Math.min(elapsed, STEP_MS * MAX_STEPS);

      let steps = 0;
      while (accumulatedTime >= STEP_MS && steps < MAX_STEPS) {
        accumulatedTime -= STEP_MS;
        steps++;
        callbackRef.current(STEP_S);
      }

      // Hit the catch-up cap: throw away the stale backlog instead of
      // burning CPU (this is what heats the phone after a notification).
      if (steps >= MAX_STEPS && accumulatedTime > STEP_MS) {
        accumulatedTime = 0;
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      cancelAnimationFrame(animationFrame);
    };
  }, [isRunning]);
};
