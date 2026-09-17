import { useEffect, useRef } from 'react';

// Lightweight animated space background: drifting, twinkling stars
// and soft moving nebula glows over the static space image.
// Kept cheap on purpose: no shadowBlur, 70 stars, capped at 30fps
// so it does not heat up low-end phones.
const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    type Star = {
      x: number;
      y: number;
      size: number;
      speed: number;
      twinklePhase: number;
      twinkleSpeed: number;
    };

    const stars: Star[] = [];
    const STAR_COUNT = 70;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.15 + 0.05,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    // Slow-moving nebula glows (soft blue and purple clouds)
    const nebulas = [
      { x: 0.25, y: 0.3, r: 0.45, color: 'rgba(40, 90, 200, 0.10)', speed: 0.00006, phase: 0 },
      { x: 0.7, y: 0.65, r: 0.5, color: 'rgba(120, 50, 200, 0.08)', speed: 0.00004, phase: 2 },
      { x: 0.5, y: 0.1, r: 0.35, color: 'rgba(0, 150, 200, 0.07)', speed: 0.00005, phase: 4 },
    ];

    let rafId = 0;
    let lastFrame = 0;
    const FRAME_MS = 1000 / 30; // 30fps cap — saves battery

    const draw = (time: number) => {
      rafId = requestAnimationFrame(draw);
      if (time - lastFrame < FRAME_MS) return;
      lastFrame = time;

      ctx.clearRect(0, 0, width, height);

      // Nebula glows (drawn first, behind the stars)
      for (const nebula of nebulas) {
        const nx = (nebula.x + Math.sin(time * nebula.speed + nebula.phase) * 0.08) * width;
        const ny = (nebula.y + Math.cos(time * nebula.speed + nebula.phase) * 0.05) * height;
        const nr = nebula.r * Math.min(width, height);
        const gradient = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(nx - nr, ny - nr, nr * 2, nr * 2);
      }

      // Stars: drift down slowly + twinkle
      for (const star of stars) {
        star.y += star.speed;
        star.twinklePhase += star.twinkleSpeed;
        if (star.y > height + 2) {
          star.y = -2;
          star.x = Math.random() * width;
        }
        const alpha = 0.35 + Math.sin(star.twinklePhase) * 0.3;
        ctx.globalAlpha = Math.max(0.08, alpha);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default StarfieldBackground;
