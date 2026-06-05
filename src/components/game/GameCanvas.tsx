import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Ball, Brick, Paddle, PowerUp, Particle, GameState, Laser, Coin, Explosion, Plane, LevelCoin } from '@/types/game';
import { useGameLoop } from '@/hooks/useGameLoop';
import { getLevels } from '@/utils/levels/index';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  generateId,
  checkBallPaddleCollision,
  checkBallBrickCollision,
  checkLaserBrickCollision,
  calculateBounceAngle,
  getBrickColor,
  shouldDropPowerUp,
  createPowerUp,
  getPowerUpColor,
  isNegativePowerUp,
  createCoin,
  createExplosion,
  getBricksInExplosionRadius,
  getChainedBricks,
  updateMovingBricks,
} from '@/utils/gameUtils';
import { drawPremiumBrick, drawPremiumPaddle, drawPremiumBall } from '@/utils/brickRenderer';
import { drawPowerUp } from '@/utils/powerUpRenderer';
import { audioManager } from '@/utils/audioManager';
import spaceBackground from '@/assets/space-background.jpg';
import { getWorldBg } from '@/utils/worldBackgrounds';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onGameOver: () => void;
  onLevelComplete: () => void;
  onScoreChange: (score: number) => void;
  emergencyRef?: React.MutableRefObject<string | null>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  setGameState,
  onGameOver,
  onLevelComplete,
  onScoreChange,
  emergencyRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [paddle, setPaddle] = useState<Paddle>({
    x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: GAME_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    hasLaser: false,
    hasMagnet: false,
    hasShield: false,
  });
  
  const shieldTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [balls, setBalls] = useState<Ball[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [levelCoins, setLevelCoins] = useState<LevelCoin[]>([]);
  const [plane, setPlane] = useState<Plane | null>(null);
  const [ballSpeed, setBallSpeed] = useState(300);
  const [isFireball, setIsFireball] = useState(false);
  const [isShock, setIsShock] = useState(false);
  const [isAutoPaddle, setIsAutoPaddle] = useState(false);
  const [autoPaddleEndTime, setAutoPaddleEndTime] = useState(0);
  const [screenShake, setScreenShake] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState(0);
  const [isBigBall, setIsBigBall] = useState(false);
  const [lastPowerUpTime, setLastPowerUpTime] = useState(0);
  const [isGhostPaddle, setIsGhostPaddle] = useState(false);
    
  const paddleTargetRef = useRef(paddle.x);
  const magnetBallRef = useRef<Ball | null>(null);
  const laserAutoFireRef = useRef<NodeJS.Timeout | null>(null);
  const aimAngleRef = useRef<number>(-Math.PI / 2);
  const lastAutoTimerRef = useRef(0);

  const prevLevelRef = useRef<number | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const userOverrideRef = useRef(false);
  const planeThrowAnimRef = useRef(0);
  const levelCompletingRef = useRef(false);
  
  const paddleRef = useRef(paddle);
  useEffect(() => { paddleRef.current = paddle; }, [paddle]);

  useEffect(() => {
    const img = new Image();
    img.src = spaceBackground;
    img.onload = () => { bgImageRef.current = img; };
    img.onerror = () => { console.error('Failed to load image'); };
  }, []);

  useEffect(() => {
    const levelChanged = prevLevelRef.current !== gameState.level;
    const justStartedPlaying = prevStatusRef.current !== 'playing' && gameState.status === 'playing' && 
                               prevStatusRef.current !== 'paused';
    
    prevLevelRef.current = gameState.level;
    prevStatusRef.current = gameState.status;
    
    if (gameState.status === 'playing' && (levelChanged || justStartedPlaying)) {
      const allLevels = getLevels();
      const levelIndex = Math.min(gameState.level - 1, allLevels.length - 1);
      const level = allLevels[levelIndex];
      
      const newBricks: Brick[] = level.bricks.map((brick) => ({
        ...brick,
        id: generateId(),
        destroyed: false,
        originalX: brick.x,
      }));
      
      setBricks(newBricks);
      setBallSpeed(level.ballSpeed);
      
      setPowerUps([]);
      setLasers([]);
      setCoins([]);
      setExplosions([]);
      setParticles([]);
      setPlane(null);
      setIsFireball(false);
      setIsBigBall(false);
      setIsShock(false);
      setIsAutoPaddle(false);
      setAutoPaddleEndTime(0);
      setIsGhostPaddle(false);
      setCombo(0);
      setComboTimer(0);
      setLastPowerUpTime(0);
      levelCompletingRef.current = false;
      planeThrowAnimRef.current = 0;
      prevBrickCountRef.current = 0;
      setPaddle(prev => ({ 
        ...prev, 
        width: PADDLE_WIDTH,
        hasLaser: false,
        hasMagnet: false,
        hasShield: false,
      }));

      if (gameState.level <= 5) {
        setTimeout(() => {
          if (levelCompletingRef.current) return;
          const laserPowerUp: PowerUp = {
            id: generateId(),
            type: 'laser',
            x: GAME_WIDTH / 2 - 25,
            y: 80,
            width: 50,
            height: 26,
            velocity: 130,
          };
          setPowerUps(prev => [...prev, laserPowerUp]);
        }, 6000);
      }
      
      if (laserAutoFireRef.current) {
        clearInterval(laserAutoFireRef.current);
        laserAutoFireRef.current = null;
      }
      
      const numCoins = Math.random() < 0.3 ? 1 : 0;
      const newLevelCoins: LevelCoin[] = [];
      for (let i = 0; i < numCoins; i++) {
        newLevelCoins.push({
          id: generateId(),
          x: 50 + Math.random() * (GAME_WIDTH - 100),
          y: 100 + Math.random() * 200,
          collected: false,
          value: Math.min(3 + Math.floor(gameState.level / 20) * 2, 8),
        });
      }
      setLevelCoins(newLevelCoins);
      
      magnetBallRef.current = {
        id: generateId(),
        position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 },
        velocity: { dx: 0, dy: 0 },
        radius: BALL_RADIUS,
      };
      setBalls([magnetBallRef.current]);
    }
  }, [gameState.status, gameState.level]);

  useEffect(() => {
    if (gameState.status === 'menu' || gameState.status === 'gameover') {
      setBricks([]);
      setBalls([]);
      setPowerUps([]);
      setParticles([]);
      setLasers([]);
      setCoins([]);
      setExplosions([]);
      setLevelCoins([]);
      setPlane(null);
      magnetBallRef.current = null;
      aimAngleRef.current = -Math.PI / 2;
      levelCompletingRef.current = false;
    }
  }, [gameState.status]);

  const prevBrickCountRef = useRef<number>(0);
  
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    if (levelCompletingRef.current) return;
    if (bricks.length === 0) return;

    const remainingBricks = bricks.filter(b => !b.destroyed && b.type !== 'indestructible');
    const hadBricks = prevBrickCountRef.current > 0;

    prevBrickCountRef.current = remainingBricks.length;

    if (remainingBricks.length === 0 && hadBricks) {
      levelCompletingRef.current = true;
      setPaddle(prev => ({ ...prev, hasLaser: false }));
      setLasers([]);
      setExplosions([]);
      setIsShock(false);
      setIsFireball(false);
      setPowerUps([]);
      if (laserAutoFireRef.current) {
        clearInterval(laserAutoFireRef.current);
        laserAutoFireRef.current = null;
      }
      setTimeout(() => onLevelComplete(), 300);
    }
  }, [bricks, gameState.status, onLevelComplete]);

  const createParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 100 + Math.random() * 150;
      newParticles.push({
        id: generateId(),
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 3 + Math.random() * 3,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const triggerScreenShake = useCallback((intensity: number) => {
    setScreenShake(intensity);
  }, []);

  const handleExplosion = useCallback((x: number, y: number) => {
    const explosion = createExplosion(x, y, 90);
    setExplosions(prev => [...prev, explosion]);
    triggerScreenShake(8);
    audioManager.playExplosion();
    createParticles(x, y, 'hsl(25, 100%, 55%)', 20);
    createParticles(x, y, 'hsl(0, 100%, 60%)', 10);
  }, [createParticles, triggerScreenShake]);

  const destroyBrick = useCallback((brick: Brick, addScore: boolean = true) => {
    if (brick.destroyed || brick.type === 'indestructible') return null;
    const scoreValue = brick.maxHits * 10 * (1 + combo * 0.1);
    audioManager.playBrickDestroy();
    if (combo > 1) audioManager.playCombo(combo);
    createParticles(brick.x + brick.width / 2, brick.y + brick.height / 2, getBrickColor(brick.color), 12);
    if (brick.type === 'explosive') handleExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2);
    if (brick.type === 'coin' && brick.color === 'gold') {
      const coin = createCoin(brick.x + brick.width / 2, brick.y + brick.height / 2);
      setCoins(prev => [...prev, coin]);
    }
    if (shouldDropPowerUp() && brick.type !== 'coin') {
      const powerUp = createPowerUp(brick.x + brick.width / 2, brick.y + brick.height);
      setPowerUps(prev => [...prev, powerUp]);
      setLastPowerUpTime(gameTime);
    }
    setCombo(prev => prev + 1);
    setComboTimer(2);
    return addScore ? scoreValue : 0;
  }, [combo, createParticles, handleExplosion, gameTime]);

  const applyPowerUp = (type: string) => {
    audioManager.playPowerUp();
    switch(type) {
      case 'expand': setPaddle(prev => ({ ...prev, width: Math.min(GAME_WIDTH, prev.width + 30) })); break;
      case 'shrink': setPaddle(prev => ({ ...prev, width: Math.max(40, prev.width - 20) })); break;
      case 'multi':
        setBalls(prev => {
          const newBalls = [...prev];
          prev.forEach(ball => {
            newBalls.push({ ...ball, id: generateId(), velocity: { dx: ball.velocity.dx + (Math.random() - 0.5) * 100, dy: -Math.abs(ball.velocity.dy) } });
          });
          return newBalls;
        });
        break;
      case 'laser': setPaddle(prev => ({ ...prev, hasLaser: true })); break;
      case 'magnet': setPaddle(prev => ({ ...prev, hasMagnet: true })); break;
      case 'fireball': setIsFireball(true); setTimeout(() => setIsFireball(false), 10000); break;
      case 'bigball': setIsBigBall(true); setBalls(prev => prev.map(b => ({ ...b, radius: BALL_RADIUS * 1.8 }))); setTimeout(() => { setIsBigBall(false); setBalls(prev => prev.map(b => ({ ...b, radius: BALL_RADIUS }))); }, 10000); break;
      case 'shield': setPaddle(prev => ({ ...prev, hasShield: true })); if (shieldTimerRef.current) clearTimeout(shieldTimerRef.current); shieldTimerRef.current = setTimeout(() => setPaddle(prev => ({ ...prev, hasShield: false })), 15000); break;
      case 'life': setGameState(prev => ({ ...prev, lives: Math.min(5, prev.lives + 1) })); break;
      case 'slow': setBallSpeed(prev => Math.max(150, prev - 40)); break;
      case 'fast': setBallSpeed(prev => Math.min(500, prev + 50)); break;
      case 'auto': setIsAutoPaddle(true); setAutoPaddleEndTime(gameTime + 15); userOverrideRef.current = false; break;
      case 'ghost': setIsGhostPaddle(true); setTimeout(() => setIsGhostPaddle(false), 10000); break;
    }
  };

  const handleLifeLost = () => {
    if (paddleRef.current.hasShield) {
      setPaddle(prev => ({ ...prev, hasShield: false }));
      setBalls([{ id: generateId(), position: { x: paddleRef.current.x + paddleRef.current.width / 2, y: paddleRef.current.y - BALL_RADIUS }, velocity: { dx: 0, dy: -ballSpeed }, radius: isBigBall ? BALL_RADIUS * 1.8 : BALL_RADIUS }]);
      audioManager.playBallLost();
      return;
    }
    setGameState(prev => {
      const newLives = prev.lives - 1;
      if (newLives <= 0) { setTimeout(() => onGameOver(), 100); return { ...prev, lives: 0, status: 'gameover' }; }
      return { ...prev, lives: newLives };
    });
    if (gameState.lives > 1) {
      audioManager.playBallLost();
      magnetBallRef.current = { id: generateId(), position: { x: paddleRef.current.x + paddleRef.current.width / 2, y: paddleRef.current.y - BALL_RADIUS }, velocity: { dx: 0, dy: 0 }, radius: isBigBall ? BALL_RADIUS * 1.8 : BALL_RADIUS };
      setBalls([magnetBallRef.current]);
      setPowerUps([]);
      setLasers([]);
      setIsFireball(false);
      setIsShock(false);
      setPaddle(prev => ({ ...prev, hasLaser: false, hasMagnet: false, hasShield: false }));
    }
  };

  const updatePhysics = useCallback((dt: number) => {
    if (gameState.status !== 'playing') return;
    
    setGameTime(prev => prev + dt);
    if (comboTimer > 0) {
      setComboTimer(prev => Math.max(0, prev - dt));
      if (comboTimer <= 0) setCombo(0);
    }
    
    if (screenShake > 0) {
      setScreenShake(prev => Math.max(0, prev - dt * 20));
    }

    // Update particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.dx * dt,
      y: p.y + p.dy * dt,
      life: p.life - dt * 1.5,
    })).filter(p => p.life > 0));

    // Update explosions
    setExplosions(prev => prev.map(e => ({
      ...e,
      radius: e.radius + 150 * dt,
      life: e.life - dt * 2,
    })).filter(e => e.life > 0));

    // Update lasers
    setLasers(prev => {
      let scoreGained = 0;
      const newLasers = prev.map(l => ({ ...l, y: l.y - l.speed * dt })).filter(l => l.y > 0);
      setBricks(prevBricks => prevBricks.map(brick => {
        if (brick.destroyed) return brick;
        const hitLaser = newLasers.find(l => checkLaserBrickCollision(l, brick));
        if (hitLaser) {
          hitLaser.y = -100;
          const newHits = brick.hits - 1;
          if (newHits <= 0 && brick.type !== 'indestructible') {
            const score = destroyBrick(brick);
            if (score) scoreGained += score;
            return { ...brick, destroyed: true, hits: 0 };
          }
          return { ...brick, hits: newHits };
        }
        return brick;
      }));
      if (scoreGained > 0) onScoreChange(scoreGained);
      return newLasers.filter(l => l.y > 0);
    });

    // Update power-ups
    setPowerUps(prev => prev.map(p => ({ ...p, y: p.y + p.velocity * dt })).filter(p => {
      if (p.y + p.height > paddleRef.current.y && p.y < paddleRef.current.y + paddleRef.current.height &&
          p.x + p.width > paddleRef.current.x && p.x < paddleRef.current.x + paddleRef.current.width) {
        applyPowerUp(p.type);
        return false;
      }
      return p.y < GAME_HEIGHT;
    }));

    // Update coins
    setCoins(prev => prev.map(c => ({ ...c, y: c.y + 150 * dt })).filter(c => {
      if (c.y + 20 > paddleRef.current.y && c.y < paddleRef.current.y + paddleRef.current.height &&
          c.x + 20 > paddleRef.current.x && c.x < paddleRef.current.x + paddleRef.current.width) {
        setGameState(prev => ({ ...prev, coins: prev.coins + 1 }));
        audioManager.playCoinCollect();
        return false;
      }
      return c.y < GAME_HEIGHT;
    }));

    // Update level coins
    setLevelCoins(prev => prev.filter(c => {
      if (c.collected) return false;
      const hit = balls.some(b => Math.sqrt((b.position.x - c.x)**2 + (b.position.y - c.y)**2) < b.radius + 15);
      if (hit) {
        setGameState(prev => ({ ...prev, coins: prev.coins + c.value }));
        audioManager.playCoinCollect();
        createParticles(c.x, c.y, 'gold', 15);
        return false;
      }
      return true;
    }));

    // Update moving bricks
    setBricks(prev => updateMovingBricks(prev, dt));

    // Update plane
    if (plane) {
      setPlane(prev => {
        if (!prev) return null;
        const planeWidth = 40;
        const newX = prev.x + prev.speed * dt;
        if (newX < 0 || newX > GAME_WIDTH - planeWidth) {
          return { ...prev, x: Math.max(0, Math.min(GAME_WIDTH - planeWidth, newX)), speed: -prev.speed };
        }
        return { ...prev, x: newX };
      });
    }

    // Update balls
    setBalls(prev => {
      const newBalls: Ball[] = [];
      prev.forEach(ball => {
        if (magnetBallRef.current?.id === ball.id) {
          newBalls.push(ball);
          return;
        }

        let newX = ball.position.x + ball.velocity.dx * dt;
        let newY = ball.position.y + ball.velocity.dy * dt;
        let newDx = ball.velocity.dx;
        let newDy = ball.velocity.dy;

        // Wall collisions
        if (newX - ball.radius < 0) {
          newX = ball.radius;
          newDx = Math.abs(newDx);
          audioManager.playWallBounce();
        } else if (newX + ball.radius > GAME_WIDTH) {
          newX = GAME_WIDTH - ball.radius;
          newDx = -Math.abs(newDx);
          audioManager.playWallBounce();
        }

        if (newY - ball.radius < 0) {
          newY = ball.radius;
          newDy = Math.abs(newDy);
          audioManager.playWallBounce();
        }

        // Paddle collision
        const collision = checkBallPaddleCollision(
          { ...ball, position: { x: newX, y: newY } },
          paddleRef.current
        );

        if (collision && newDy > 0) {
          if (paddleRef.current.hasMagnet) {
            magnetBallRef.current = ball;
            newDx = 0;
            newDy = 0;
            audioManager.playMagnetCatch();
          } else {
            newDy = -Math.abs(newDy);
            newDx = Math.sin(calculateBounceAngle({ ...ball, position: { x: newX, y: newY } }, paddleRef.current)) * ballSpeed;
            audioManager.playPaddleHit();
          }
        }

        newBalls.push({ ...ball, position: { x: newX, y: newY }, velocity: { dx: newDx, dy: newDy } });
      });
      return newBalls;
    });

    // Brick collisions
    setBricks(prevBricks => {
      let scoreGained = 0;
      const updatedBricks = prevBricks.map(brick => {
        if (brick.destroyed) return brick;
        let hitByBall = false;
        setBalls(prevBalls => prevBalls.map(ball => {
          if (ball.velocity.dx === 0 && ball.velocity.dy === 0) return ball;
          const collision = checkBallBrickCollision(ball, brick);
          if (collision) {
            hitByBall = true;
            if (!isFireball && brick.type !== 'ghost') {
              ball.velocity.dy = -ball.velocity.dy;
            }
          }
          return ball;
        }));

        if (hitByBall || (isShock && Math.random() < 0.005)) {
          const damage = isFireball ? 3 : 1;
          const newHits = brick.hits - damage;
          if (newHits <= 0 && brick.type !== 'indestructible') {
            const score = destroyBrick(brick);
            if (score) scoreGained += score;
            if (brick.type === 'chain') {
              const chained = getChainedBricks(brick, prevBricks);
              chained.forEach(cb => { const s = destroyBrick(cb); if (s) scoreGained += s; cb.destroyed = true; });
            }
            return { ...brick, destroyed: true, hits: 0 };
          }
          return { ...brick, hits: newHits };
        }
        return brick;
      });
      if (scoreGained > 0) onScoreChange(scoreGained);
      return updatedBricks;
    });

    // Check for life lost
    setBalls(prev => {
      const remaining = prev.filter(b => b.position.y - b.radius < GAME_HEIGHT);
      if (remaining.length === 0 && gameState.status === 'playing' && !levelCompletingRef.current) {
        handleLifeLost();
      }
      return remaining;
    });

  }, [gameState.status, comboTimer, screenShake, gameTime, plane, balls, bricks, isFireball, isShock, ballSpeed, destroyBrick, onScoreChange, onLevelComplete]);

  useGameLoop((dt) => {
    const subSteps = 5;
    const subDt = dt / subSteps;
    for (let i = 0; i < subSteps; i++) {
      updatePhysics(subDt);
    }
  }, gameState.status === 'playing');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      if (bgImageRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.drawImage(bgImageRef.current, 0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.restore();
      }
      
      const worldBg = getWorldBg(gameState.level);
     ctx.fillStyle = worldBg.base;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.save();
      if (screenShake > 0) {
        const dx = (Math.random() - 0.5) * screenShake;
        const dy = (Math.random() - 0.5) * screenShake;
        ctx.translate(dx, dy);
      }

      bricks.forEach(brick => { if (!brick.destroyed) drawPremiumBrick(ctx, brick); });
      ctx.restore();
      levelCoins.forEach(coin => {
        if (!coin.collected) {
          ctx.save();
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'gold';
          ctx.fillStyle = 'gold';
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'white';
          ctx.font = 'bold 12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('$', coin.x, coin.y + 4);
          ctx.restore();
        }
      });
      powerUps.forEach(p => drawPowerUp(ctx, p, gameTime));
      coins.forEach(c => {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(c.x + 10, c.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      lasers.forEach(l => {
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff0000';
        ctx.fillRect(l.x - 2, l.y, 4, 15);
      });
      particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      explosions.forEach(e => {
        const grad = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.radius);
        grad.addColorStop(0, `rgba(255, 100, 0, ${e.life})`);
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      if (plane) {
        ctx.fillStyle = '#555';
        ctx.fillRect(plane.x, plane.y, 40, 15);
        ctx.fillStyle = '#333';
        ctx.fillRect(plane.x + 10, plane.y - 5, 20, 25);
        if (plane.hasPowerUp) {
          ctx.fillStyle = 'cyan';
          ctx.beginPath();
                  ctx.arc(plane.x + 20, plane.y + 20, 5, 0, Math.PI * 2);
        ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      drawPremiumPaddle(ctx, paddle.x, paddle.y, paddle.width, paddle.height, paddle.hasLaser, paddle.hasMagnet, paddle.hasShield, isGhostPaddle);
      
      balls.forEach(ball => drawPremiumBall(ctx, ball.position.x, ball.position.y, ball.radius, isFireball, isBigBall));

      if (magnetBallRef.current) {
        const ball = balls.find(b => b.id === magnetBallRef.current?.id);
        if (ball) {
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.beginPath();
          ctx.moveTo(ball.position.x, ball.position.y);
          ctx.lineTo(ball.position.x + Math.cos(aimAngleRef.current) * 100, ball.position.y + Math.sin(aimAngleRef.current) * 100);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [bricks, balls, paddle, powerUps, particles, lasers, coins, explosions, plane, levelCoins, screenShake, isFireball, isGhostPaddle, gameState.level]);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden touch-none">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="max-w-full max-h-full object-contain shadow-2xl" />
    </div>
  );
};

export default GameCanvas;
