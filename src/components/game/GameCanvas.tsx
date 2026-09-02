import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Ball, Brick, Paddle, PowerUp, Particle, GameState, Laser, Coin, Explosion, Plane, LevelCoin } from '@/types/game';
import { useGameLoop } from '@/hooks/useGameLoop';
import { levels } from '@/utils/levels/index';
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
import {
  isMonsterLevel, getMonsterName, getMonsterSpeed,
  MONSTER_COLS, MONSTER_ROWS, MONSTER_BRICK_WIDTH, MONSTER_BRICK_HEIGHT,
  MONSTER_START_X, MONSTER_START_Y, MONSTER_BODY_WIDTH, MONSTER_BODY_HEIGHT,
} from '@/utils/monsterLevels';
import { getMonsterImage, preloadMonsterImages } from '@/utils/monsterImages';

// Brick entrance animation: bricks fall in and settle before play starts
const ENTRANCE_MS = 1300;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Haptics: ONLY Big Ball vibrates (0.20 second = 200ms)
// Normal ball = no vibration
let lastVibrateAt = 0;
let isBigBallActive = false;
const impactVibrate = (ballRadius: number) => {
  if (!isBigBallActive && ballRadius <= BALL_RADIUS * 1.25) return;
  const now = performance.now();
  if (now - lastVibrateAt < 80) return; // small throttle
  lastVibrateAt = now;
  try {
    navigator.vibrate?.(100); // exactly 0.10 second
  } catch {}
};

import { drawPowerUp } from '@/utils/powerUpRenderer';
import { audioManager } from '@/utils/audioManager';
import spaceBackground from '@/assets/space-background.jpg';
import { getWorldBg, getWorldBgImage } from '@/utils/worldBackgrounds';

// Alien ship system is currently disabled — these stubs keep dead references compiling.
const updateAlienShips = (ships: any[], _dt: number) => ships;
const checkBallShipCollision = (_x: number, _y: number, _r: number, _s: any) => false;
const checkLaserShipCollision = (_x: number, _y: number, _s: any) => false;
const getShipScore = (_s: any) => 0;

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
  const bgCacheRef = useRef<HTMLCanvasElement | null>(null);
  const bgCacheSizeRef = useRef<{ w: number; h: number; dpr: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [paddle, setPaddle] = useState<Paddle>({
    x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: GAME_HEIGHT - 70,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    hasLaser: false,
    hasMagnet: false,
    hasShield: false,
  });
  
  // Track shield expiry time
  const shieldTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [balls, setBalls] = useState<Ball[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
const ballsRef = useRef<Ball[]>([]);
const bricksRef = useRef<Brick[]>([]);
const gameTimeRef = useRef(0);
const lastHudSecondRef = useRef(-1);
const particleCountRef = useRef(0);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [levelCoins, setLevelCoins] = useState<LevelCoin[]>([]);
  const [plane, setPlane] = useState<Plane | null>(null);
  const [alienShips, setAlienShips] = useState<any[]>([]);
  const [alienBullets, setAlienBullets] = useState<any[]>([]);
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
  const [shieldEndTime, setShieldEndTime] = useState(0);
  const [ghostEndTime, setGhostEndTime] = useState(0);

  // Authoritative mutable mirror of values the input/physics path needs every
  // frame. Reading these from refs keeps event handlers stable so window
  // listeners are NOT re-registered on every animation frame (major stutter
  // + heat source on low-end phones).
  const engineRef = useRef({
    ballSpeed: 300,
    isAutoPaddle: false,
    paddleWidth: PADDLE_WIDTH,
    hasMagnet: false,
  });
const autoPaddleEndTimeRef = useRef(0);
const shieldEndTimeRef = useRef(0);

  const paddleTargetRef = useRef(paddle.x);

  const magnetBallRef = useRef<Ball | null>(null);
  const laserAutoFireRef = useRef<NodeJS.Timeout | null>(null);
  const aimAngleRef = useRef<number>(-Math.PI / 2);
  const lastAutoTimerRef = useRef(0);

  // Monster (boss) level state
  const monsterDirRef = useRef(1);
  const monsterTotalHpRef = useRef(0);
  const levelStartTimeRef = useRef(0);
  const [monsterHp, setMonsterHp] = useState({ current: 0, max: 0 });
  // Boss fireballs spat from the monster's mouth toward the paddle
  const [monsterFires, setMonsterFires] = useState<
    { id: string; x: number; y: number; vx: number; vy: number }[]
  >([]);
  const monsterFireCdRef = useRef(1.8);
  const isMonster = isMonsterLevel(gameState.level);


  // Preload the boss artworks once so monster levels never start blank
  useEffect(() => { preloadMonsterImages(); }, []);

  // Track previous level to only reinitialize on level change
  const prevLevelRef = useRef<number | null>(null);
  const prevStatusRef = useRef<string | null>(null);

  // Track user override for auto-paddle - instant control on touch, resume on release
  const userOverrideRef = useRef(false);
  
  // Plane throw animation
  const planeThrowAnimRef = useRef(0);
  
  // Level completing flag to prevent laser firing during transition
  const levelCompletingRef = useRef(false);
  
  // Initialize level - only reinitialize when level actually changes (not on pause/resume)
  useEffect(() => {
  const img = getWorldBgImage(gameState.level);
  if (img.complete && img.naturalWidth > 0) {
    // Already decoded (preloaded) -> show instantly on level start
    bgImageRef.current = img;
    bgCacheRef.current = null;
    return;
  }
  const onLoad = () => {
    bgImageRef.current = img;
    bgCacheRef.current = null; // force rebuild cache
  };
  img.addEventListener('load', onLoad);
  return () => img.removeEventListener('load', onLoad);
}, [gameState.level]);

useEffect(() => {
  const levelChanged = prevLevelRef.current !== gameState.level;
  const justStartedPlaying = prevStatusRef.current !== 'playing' && gameState.status === 'playing' && 
                             prevStatusRef.current !== 'paused';
  
  prevLevelRef.current = gameState.level;
  prevStatusRef.current = gameState.status;
  
  if (gameState.status === 'playing' && (levelChanged || justStartedPlaying)) {
    const levelIndex = Math.min(gameState.level - 1, levels.length - 1);
    const level = levels[levelIndex];
    
    // Keep bottom area free for paddle
    const BRICK_FREE_TOP = GAME_HEIGHT * 0.65;
    const newBricks: Brick[] = level.bricks
      .filter(brick => (brick.y + brick.height) <= BRICK_FREE_TOP)
      .map((brick) => ({
        ...brick,
        id: generateId(),
        destroyed: false,
        originalX: brick.x,
      }));
    
    bricksRef.current = newBricks;
setBricks(newBricks);


    // Monster level setup
    if (isMonsterLevel(gameState.level)) {
      const totalHp = newBricks.reduce((sum, b) => sum + b.maxHits, 0);
      monsterTotalHpRef.current = totalHp;
      monsterDirRef.current = 1;
      setMonsterHp({ current: totalHp, max: totalHp });
    } else {
      monsterTotalHpRef.current = 0;
      setMonsterHp({ current: 0, max: 0 });
    }
    levelStartTimeRef.current = performance.now();
    audioManager.setBossMode(isMonsterLevel(gameState.level));

    const baseBallSpeed = level.ballSpeed;
    setBallSpeed(baseBallSpeed);
    
    // =====================================================
    // FULL POWER-UP & EFFECT RESET (fixes carry-over bug)
    // =====================================================
    setMonsterFires([]);
    monsterFireCdRef.current = 2.2;
    setPowerUps([]);
    setLasers([]);
    setCoins([]);
    setExplosions([]);
    setParticles([]);
    setPlane(null);
    setAlienShips([]);
    setAlienBullets([]);

    // Clear all power-up flags
    setIsFireball(false);
    setIsBigBall(false);
    isBigBallActive = false;
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

    // Clear any running timers from previous level
    if ((window as any).__shockTimer) {
      clearTimeout((window as any).__shockTimer);
      (window as any).__shockTimer = null;
    }
    if ((window as any).__laserTimer) {
      clearTimeout((window as any).__laserTimer);
      (window as any).__laserTimer = null;
    }
    if ((window as any).__autoTimer) {
      clearTimeout((window as any).__autoTimer);
      (window as any).__autoTimer = null;
    }

    // Clear laser auto-fire interval
    if (laserAutoFireRef.current) {
      clearInterval(laserAutoFireRef.current);
      laserAutoFireRef.current = null;
    }

    // Reset paddle completely
    setPaddle(prev => ({
      ...prev,
      width: PADDLE_WIDTH,
      hasLaser: false,
      hasMagnet: false,
      hasShield: false,
    }));

    // Clear emergency power-up from parent
    if (emergencyRef) {
      emergencyRef.current = null;
    }

    // Free laser gun for first 5 levels
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
    
    // Level coins
    const numCoins = Math.random() < 0.3 ? 1 : 0;
    const newLevelCoins: LevelCoin[] = [];
    for (let i = 0; i < numCoins; i++) {
      newLevelCoins.push({
        id: generateId(),
        x: 50 + Math.random() * (GAME_WIDTH - 100),
        y: 100 + Math.random() * 200,
        collected: false,
        value: 1,
      });
    }
    setLevelCoins(newLevelCoins);
    
    // Reset ball
    magnetBallRef.current = {
      id: generateId(),
      position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 90 },
      velocity: { dx: 0, dy: 0 },
      radius: BALL_RADIUS,
    };
    ballsRef.current = [magnetBallRef.current];
setBalls([magnetBallRef.current]);

  }
}, [gameState.status, gameState.level]);

  // Reset on game over
  useEffect(() => {
    if (gameState.status === 'menu' || gameState.status === 'gameover') {
      bricksRef.current = [];
ballsRef.current = [];
setBricks([]);
setBalls([]);
gameTimeRef.current = 0;
lastHudSecondRef.current = -1;

      setPowerUps([]);
      setParticles([]);
      setLasers([]);
      setCoins([]);
      setExplosions([]);
      setLevelCoins([]);
      setPlane(null);
      setAlienShips([]);
      setAlienBullets([]);
      setMonsterFires([]);
      magnetBallRef.current = null;
      aimAngleRef.current = -Math.PI / 2;
      levelCompletingRef.current = false;
      audioManager.setBossMode(false);
    }

  }, [gameState.status]);
useEffect(() => {
  ballsRef.current = balls;
}, [balls]);

// Keep the mutable engine mirror in sync (cheap, once per commit).
engineRef.current.ballSpeed = ballSpeed;
engineRef.current.isAutoPaddle = isAutoPaddle;
engineRef.current.paddleWidth = paddle.width;
engineRef.current.hasMagnet = !!paddle.hasMagnet;
particleCountRef.current = particles.length;


useEffect(() => {
  bricksRef.current = bricks;
}, [bricks]);

useEffect(() => {
  paddleRef.current = paddle;
}, [paddle]);


  // Track previous brick count for level completion check
  const prevBrickCountRef = useRef<number>(0);
  
  // Check for level completion
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    if (levelCompletingRef.current) return;
        if (performance.now() - levelStartTimeRef.current < ENTRANCE_MS + 300) return;
    // Need actual bricks loaded for this level
    if (bricks.length === 0) return;

    const remainingBricks = bricks.filter(b => !b.destroyed && b.type !== 'indestructible');
    const hadBricks = prevBrickCountRef.current > 0;

    // Update tracker FIRST so the next render has the correct baseline
    prevBrickCountRef.current = remainingBricks.length;

    // Level completes when all bricks are destroyed (alien ships are bonus, not required)
    if (remainingBricks.length === 0 && hadBricks) {
      levelCompletingRef.current = true;
      setPaddle(prev => ({ ...prev, hasLaser: false }));
      setLasers([]);
      setExplosions([]);
      setIsShock(false);
      setIsFireball(false);
      setPowerUps([]);
      // Monster defeated -> stop the boss battle music immediately
      setMonsterFires([]);
      audioManager.setBossMode(false);
      if (laserAutoFireRef.current) {
        clearInterval(laserAutoFireRef.current);
        laserAutoFireRef.current = null;
      }
      setTimeout(() => onLevelComplete(), 300);
    }

  }, [bricks, alienShips, gameState.status, onLevelComplete]);

  // Create particles
    const createParticles = useCallback((x: number, y: number, color: string, count: number = 6) => {
    count = Math.min(count, 10);
    const reducedCount = Math.ceil(count * 0.5); // Reduce particles by 50% for performance
    const newParticles: Particle[] = [];
    for (let i = 0; i < reducedCount; i++) {
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
    setParticles(prev => {
      // Limit max particles to 50 to prevent heating
      const combined = [...prev, ...newParticles];
      return combined.length > 50 ? combined.slice(-50) : combined;
    });
  }, []);

  // Trigger screen shake
  const triggerScreenShake = useCallback((intensity: number) => {
    setScreenShake(intensity);
  }, []);

  // Handle explosion chain
  const handleExplosion = useCallback((x: number, y: number) => {
    const explosion = createExplosion(x, y, 90);
    setExplosions(prev => [...prev, explosion]);
    triggerScreenShake(8);
    audioManager.playExplosion();
    
    createParticles(x, y, 'hsl(25, 100%, 55%)', 20);
    createParticles(x, y, 'hsl(50, 100%, 55%)', 15);
    createParticles(x, y, 'hsl(0, 100%, 60%)', 10);
  }, [createParticles, triggerScreenShake]);

  // Handle brick destruction
  const destroyBrick = useCallback((brick: Brick, addScore: boolean = true) => {
    if (brick.destroyed || brick.type === 'indestructible') return null;
    
    const scoreValue = brick.maxHits * 10 * (1 + combo * 0.1);
    
    audioManager.playBrickDestroy();
if (isShock) {
  audioManager.playElectricZap();
}
    if (combo > 1) {
      audioManager.playCombo(combo);
    }
    
    createParticles(
      brick.x + brick.width / 2,
      brick.y + brick.height / 2,
      getBrickColor(brick.color),
      12
    );
    
    if (brick.type === 'explosive') {
      handleExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2);
    }
    
    if (brick.type === 'coin') {
            // Gold bricks release 1 coin when broken (reduced from 3)
      if (brick.color === 'gold') {
        const coin = createCoin(brick.x + brick.width / 2, brick.y + brick.height / 2);
        setCoins(prev => [...prev, coin]);
      }
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

  // Handle paddle movement and aim direction
  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    const pw = engineRef.current.paddleWidth;

    // During aiming (ball on paddle), rotate aim arrow
    if (magnetBallRef.current) {
      const ball = ballsRef.current.find(b => b.id === magnetBallRef.current?.id);
      if (ball) {
        const dx = x - ball.position.x;
        const dy = y - ball.position.y;
        let angle = Math.atan2(dy, dx);
        if (angle > 0) angle = -0.01;
        if (angle < -Math.PI) angle = -Math.PI + 0.01;
        aimAngleRef.current = angle;
      }
      // Only allow paddle movement during magnet powerup, NOT initial aiming
      if (engineRef.current.hasMagnet) {
        paddleTargetRef.current = Math.max(0, Math.min(GAME_WIDTH - pw, x - pw / 2));
      }
      return;
    }
    
    // Auto-paddle: user touching = instant override
    if (engineRef.current.isAutoPaddle) {
      userOverrideRef.current = true;
    }
    
    paddleTargetRef.current = Math.max(0, Math.min(GAME_WIDTH - pw, x - pw / 2));
  }, []);


  // Fire laser
  const paddleRef = useRef(paddle);
paddleRef.current = paddle;


  
  const fireLaser = useCallback(() => {
    // Don't fire if level is completing
    if (levelCompletingRef.current) return;
    if (paddleRef.current.hasLaser) {
      audioManager.playLaser();
      setLasers(prev => [
        ...prev,
        { id: generateId(), x: paddleRef.current.x + 10, y: paddleRef.current.y, speed: 600 },
        { id: generateId(), x: paddleRef.current.x + paddleRef.current.width - 10, y: paddleRef.current.y, speed: 600 },
      ]);
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (gameState.status === 'playing') {
        handlePointerMove(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (gameState.status === 'playing' && e.touches.length > 0) {
        if ((e.target as HTMLElement).closest('button')) return;
        e.preventDefault();
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const releaseMagnetBall = () => {
      // Bricks must finish falling into place before the ball can launch
            if (performance.now() - levelStartTimeRef.current < ENTRANCE_MS + 250) return;
      if (magnetBallRef.current) {
        const ballId = magnetBallRef.current.id;
        const angle = aimAngleRef.current;
        magnetBallRef.current = null;
        audioManager.playMagnetRelease();
        setBalls(prevBalls => prevBalls.map(ball => {
          if (ball.id === ballId) {
            const speed = engineRef.current.ballSpeed;
            return {
              ...ball,
              velocity: { 
                dx: Math.cos(angle) * speed, 
                dy: Math.sin(angle) * speed 
              },
            };
          }
          return ball;
        }));
        aimAngleRef.current = -Math.PI / 2;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (gameState.status === 'playing' && e.touches.length > 0) {
        if ((e.target as HTMLElement).closest('button')) return;
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    // When user releases touch/mouse, fire ball if aiming + resume auto-paddle
    const handlePointerUp = () => {
      if (magnetBallRef.current) {
        releaseMagnetBall();
      }
      if (engineRef.current.isAutoPaddle) {
        userOverrideRef.current = false;
      }
    };

    const handleClick = () => {
      // Ball release handled by pointerUp
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('click', handleClick);
    };
  }, [gameState.status, handlePointerMove]);
  
  // Auto-fire laser when paddle has laser power-up
  useEffect(() => {
    if (laserAutoFireRef.current) {
      clearInterval(laserAutoFireRef.current);
      laserAutoFireRef.current = null;
    }
    
    // Only fire laser when STRICTLY playing and level not completing
    if (paddle.hasLaser && gameState.status === 'playing' && !levelCompletingRef.current) {
      fireLaser();
      
      laserAutoFireRef.current = setInterval(() => {
        if (paddleRef.current.hasLaser && !levelCompletingRef.current) {
          fireLaser();
        } else {
          if (laserAutoFireRef.current) {
            clearInterval(laserAutoFireRef.current);
            laserAutoFireRef.current = null;
          }
        }
      }, 300);
    }
    
    return () => {
      if (laserAutoFireRef.current) {
        clearInterval(laserAutoFireRef.current);
        laserAutoFireRef.current = null;
      }
    };
  }, [paddle.hasLaser, gameState.status, fireLaser]);

  // Game loop
  const gameLoop = useCallback((deltaTime: number) => {
const nextGameTime = gameTimeRef.current + deltaTime;
gameTimeRef.current = nextGameTime;

     if (levelCompletingRef.current) {
    return;
  }
    // Use fixed sub-steps for smoother physics (capped at 4 to prevent ball tunneling through bricks)
        const clampedDt = Math.min(deltaTime, 0.033);
const numSteps = Math.min(4, Math.max(2, Math.ceil(clampedDt / 0.008)));
const stepDt = clampedDt / numSteps;
    
    // Check emergency powerup activation
    if (emergencyRef?.current) {
      const type = emergencyRef.current;
      emergencyRef.current = null;
      switch(type) {
        case 'auto':
          setIsAutoPaddle(true);
          engineRef.current.isAutoPaddle = true;
          setAutoPaddleEndTime(gameTime + 15);
          userOverrideRef.current = false;
          break;
        case 'shock':
          setIsShock(true);
          setTimeout(() => setIsShock(false), 10000);
          break;
        case 'multi':
          setBalls(prev => {
            const movingBalls = prev.filter(b => b.velocity.dx !== 0 || b.velocity.dy !== 0);
            if (movingBalls.length === 0) return prev;
            const newBalls: Ball[] = [...prev];
            movingBalls.forEach(ball => {
              const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2) || ballSpeed;
              newBalls.push({
                ...ball,
                id: generateId(),
                velocity: { dx: (Math.random() - 0.5) * speed * 0.4, dy: -Math.abs(speed) },
              });
            });
            return newBalls;
          });
          break;
        case 'laser':
          // #12 Laser Gun emergency: 10 seconds of auto-firing lasers.
          setPaddle(prev => ({ ...prev, hasLaser: true }));
          setTimeout(() => setPaddle(prev => ({ ...prev, hasLaser: false })), 10000);
          break;
      }
    }

    const hudSecond = Math.floor(nextGameTime);
if (hudSecond !== lastHudSecondRef.current) {
  lastHudSecondRef.current = hudSecond;
  setGameTime(nextGameTime);
}

    
    // Update combo timer
    setComboTimer(prev => {
      if (prev > 0) {
        const newTimer = prev - deltaTime;
        if (newTimer <= 0) {
          setCombo(0);
          return 0;
        }
        return newTimer;
      }
      return 0;
    });
    
    // Update screen shake
    setScreenShake(prev => Math.max(0, prev - deltaTime * 20));

    // Check auto-paddle expiry using the authoritative engine clock.
if (
  engineRef.current.isAutoPaddle &&
  autoPaddleEndTimeRef.current > 0 &&
  nextGameTime >= autoPaddleEndTimeRef.current
) {
  engineRef.current.isAutoPaddle = false;
  autoPaddleEndTimeRef.current = 0;
  setIsAutoPaddle(false);
  setAutoPaddleEndTime(0);
}

// Check shield expiry using the authoritative engine clock.
if (
  shieldEndTimeRef.current > 0 &&
  nextGameTime >= shieldEndTimeRef.current
) {
  shieldEndTimeRef.current = 0;
  paddleRef.current = {
    ...paddleRef.current,
    hasShield: false,
  };
  setShieldEndTime(0);
  setPaddle(prev => (prev.hasShield ? { ...prev, hasShield: false } : prev));
}

// Update auto-paddle timer in the HUD.
if (
  engineRef.current.isAutoPaddle &&
  autoPaddleEndTimeRef.current > 0
) {
  const remaining = Math.max(
    0,
    Math.ceil(autoPaddleEndTimeRef.current - nextGameTime),
  );

  if (remaining !== lastAutoTimerRef.current) {
    lastAutoTimerRef.current = remaining;
    setGameState(prev => ({ ...prev, autoTimer: remaining }));
  }
} else if (lastAutoTimerRef.current !== 0) {
  lastAutoTimerRef.current = 0;
  setGameState(prev => ({ ...prev, autoTimer: 0 }));
}

// Update shield timer in the HUD.
if (shieldEndTimeRef.current > 0) {
  const shieldRemaining = Math.max(
    0,
    Math.ceil(shieldEndTimeRef.current - nextGameTime),
  );

  setGameState(prev => {
    if (prev.shieldTimer !== shieldRemaining) {
      return { ...prev, shieldTimer: shieldRemaining };
    }
    return prev;
  });
} else {
  setGameState(prev => {
    if (prev.shieldTimer !== 0) {
      return { ...prev, shieldTimer: 0 };
    }
    return prev;
  });
}

// Update ghost timer in the HUD.
if (ghostEndTime > 0) {
  const ghostRemaining = Math.max(
    0,
    Math.ceil(ghostEndTime - nextGameTime),
  );

  setGameState(prev => {
    if (prev.ghostTimer !== ghostRemaining) {
      return { ...prev, ghostTimer: ghostRemaining };
    }
    return prev;
  });
} else {
  setGameState(prev => {
    if (prev.ghostTimer !== 0) {
      return { ...prev, ghostTimer: 0 };
    }
    return prev;
  });
}



    // Spawn plane if no power-up dropped for 90 seconds
    if (gameTime - lastPowerUpTime > 90 && !plane) {
      setPlane({
        id: generateId(),
        x: -60,
        y: 35,
        speed: 100,
        hasPowerUp: true,
      });
      setLastPowerUpTime(gameTime);
    }

    // Update plane
    if (plane) {
      const newX = plane.x + plane.speed * deltaTime;
      
      if (plane.hasPowerUp && newX >= GAME_WIDTH / 2) {
        const powerUp = createPowerUp(newX, plane.y + 20);
        setPowerUps(prev => [...prev, powerUp]);
        setPlane(prev => prev ? { ...prev, hasPowerUp: false } : null);
        // Start throw animation
        planeThrowAnimRef.current = 1.0;
      }
      
      if (newX > GAME_WIDTH + 60) {
        setPlane(null);
      } else {
        setPlane(prev => prev ? { ...prev, x: newX } : null);
      }
    }
    
    // Update throw animation
    if (planeThrowAnimRef.current > 0) {
      planeThrowAnimRef.current = Math.max(0, planeThrowAnimRef.current - deltaTime * 2);
    }

    // Auto-paddle logic - predict where ball will arrive at paddle level
    if (isAutoPaddle) {
      if (!userOverrideRef.current) {
        const activeBalls = balls.filter(b => b.velocity.dy !== 0 || b.velocity.dx !== 0);
        if (activeBalls.length > 0) {
          // Find the ball closest to paddle and moving downward
          const descendingBalls = activeBalls.filter(b => b.velocity.dy > 0);
          const targetBall = descendingBalls.length > 0
            ? descendingBalls.reduce((closest, ball) => ball.position.y > closest.position.y ? ball : closest)
            : activeBalls.reduce((lowest, ball) => ball.position.y > lowest.position.y ? ball : lowest);
          
          // Predict X position at paddle Y level
          let predictX = targetBall.position.x;
          if (targetBall.velocity.dy > 0) {
            const timeToReach = (paddle.y - targetBall.position.y) / targetBall.velocity.dy;
            if (timeToReach > 0 && timeToReach < 3) {
              predictX = targetBall.position.x + targetBall.velocity.dx * timeToReach;
              // Handle wall bounces in prediction
              while (predictX < 0 || predictX > GAME_WIDTH) {
                if (predictX < 0) predictX = -predictX;
                if (predictX > GAME_WIDTH) predictX = GAME_WIDTH * 2 - predictX;
              }
            }
          }
          paddleTargetRef.current = Math.max(0, Math.min(GAME_WIDTH - paddle.width, predictX - paddle.width / 2));
        }
      }
    } else {
      userOverrideRef.current = false;
    }

    // Ghost paddle logic - when ball approaches paddle, INSTANTLY jump paddle away
    if (isGhostPaddle && !isAutoPaddle) {
      const activeBalls = balls.filter(b => b.velocity.dy > 0);
      for (const ball of activeBalls) {
        if (ball.position.y > GAME_HEIGHT * 0.65) {
          const paddleCenter = paddle.x + paddle.width / 2;
          const ballX = ball.position.x;
          // Instantly teleport paddle 150px in opposite direction of ball
          const pushDir = ballX > paddleCenter ? -1 : 1;
          const newX = Math.max(0, Math.min(GAME_WIDTH - paddle.width, paddle.x + pushDir * 150));
          paddleTargetRef.current = newX;
          // Override smooth movement â€” force instant jump
          setPaddle(prev => ({ ...prev, x: newX }));
          break; // Only react to closest ball
        }
      }
    }

    // Smooth paddle movement
    setPaddle(prev => {
      const diff = paddleTargetRef.current - prev.x;
      const newX = prev.x + diff * Math.min(1, deltaTime * 15);
      return { ...prev, x: newX };
    });

    // Update moving bricks
    //setBricks(prev => updateMovingBricks(prev, deltaTime));

    // Monster level: slide the whole creature left <-> right as one body
    if (isMonsterLevel(gameState.level)) {
      const hpRatio = monsterHp.max ? monsterHp.current / monsterHp.max : 1;
      const speed = getMonsterSpeed(gameState.level) * (hpRatio <= 0.25 ? 2.2 : 1);
      setBricks(prev => {
        const alive = prev.filter(b => !b.destroyed);
        if (alive.length === 0) return prev;
        const minX = Math.min(...alive.map(b => b.x));
        const maxX = Math.max(...alive.map(b => b.x + b.width));
        let dir = monsterDirRef.current;
        if (dir > 0 && maxX >= GAME_WIDTH - 6) dir = -1;
        else if (dir < 0 && minX <= 6) dir = 1;
        monsterDirRef.current = dir;
        const dx = dir * speed * deltaTime;
        return prev.map(b => (b.destroyed ? b : { ...b, x: b.x + dx }));
      });
      const hpLeft = bricks.reduce((sum, b) => (b.destroyed ? sum : sum + b.hits), 0);
      setMonsterHp(prev => (prev.current === hpLeft ? prev : { ...prev, current: hpLeft }));

      // ---- Boss breathes fireballs at the paddle ----
      const aliveB = bricks.filter(b => !b.destroyed);
      if (aliveB.length > 0 && !levelCompletingRef.current) {
        const enraged = hpRatio <= 0.25;
        monsterFireCdRef.current -= deltaTime;
        if (monsterFireCdRef.current <= 0) {
          monsterFireCdRef.current = (enraged ? 1.3 : 2.6) + Math.random() * (enraged ? 0.8 : 1.4);
          const minX = Math.min(...aliveB.map(b => b.x));
          const maxX = Math.max(...aliveB.map(b => b.x + b.width));
          const mouthX = (minX + maxX) / 2;
          const mouthY = Math.max(...aliveB.map(b => b.y + b.height)) - 6;
          const targetX = paddle.x + paddle.width / 2;
          const speed = enraged ? 260 : 200;
          const ang = Math.atan2(paddle.y - mouthY, targetX - mouthX);
          setMonsterFires(prev => [
            ...prev,
            {
              id: generateId(),
              x: mouthX,
              y: mouthY,
              vx: Math.cos(ang) * speed,
              vy: Math.abs(Math.sin(ang) * speed) || speed,
            },
          ]);
          createParticles(mouthX, mouthY, 'hsl(20, 100%, 55%)', 10);
          audioManager.playMonsterRoar?.();
        }
      }
    }

    // Move boss fireballs + check paddle hit (a hit costs a life).
    // NOTE: collision is resolved synchronously here (NOT inside the state
    // updater, which runs later during render) so the life is actually lost.
    if (monsterFires.length > 0) {
      const FIRE_R = 11;
      const px1 = paddle.x - FIRE_R;
      const px2 = paddle.x + paddle.width + FIRE_R;
      const py1 = paddle.y - FIRE_R;
      const py2 = paddle.y + paddle.height + FIRE_R;

      let hitPaddle = false;
      const nextFires: typeof monsterFires = [];
      for (const f of monsterFires) {
        // sub-step so a fast fireball can never tunnel through the paddle
        const steps = 4;
        let nx = f.x;
        let ny = f.y;
        let consumed = false;
        for (let s = 0; s < steps; s++) {
          nx += (f.vx * deltaTime) / steps;
          ny += (f.vy * deltaTime) / steps;
          if (nx > px1 && nx < px2 && ny > py1 && ny < py2) {
            hitPaddle = true;
            consumed = true;
            createParticles(nx, ny, 'hsl(15, 100%, 55%)', 24);
            break;
          }
        }
        if (consumed) continue;
        if (ny > GAME_HEIGHT + 20) continue;
        nextFires.push({ ...f, x: nx, y: ny });
      }

                  if (hitPaddle) {
        setMonsterFires([]);
        setScreenShake(14);
        audioManager.playBallLost();
        try { navigator.vibrate?.(200); } catch {}

        setGameState(prev => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            audioManager.setBossMode(false);
            setTimeout(() => onGameOver(), 100);
            return { ...prev, lives: 0, status: 'gameover' };
          }
          return { ...prev, lives: newLives };
        });

        // Full reset like a normal ball loss
        setCombo(0);
        setComboTimer(0);
        setIsFireball(false);
        setIsBigBall(false);
        setIsShock(false);
        setIsAutoPaddle(false);
        setAutoPaddleEndTime(0);
autoPaddleEndTimeRef.current = 0;
shieldEndTimeRef.current = 0;
engineRef.current.isAutoPaddle = false;
paddleRef.current = {
  ...paddleRef.current,
  hasShield: false,
};

        setIsGhostPaddle(false);
        setLasers([]);
        if (laserAutoFireRef.current) {
          clearInterval(laserAutoFireRef.current);
          laserAutoFireRef.current = null;
        }

        setPaddle(prev => ({
          ...prev,
          x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
          width: PADDLE_WIDTH,
          hasLaser: false,
          hasMagnet: false,
          hasShield: false,
        }));
        paddleTargetRef.current = GAME_WIDTH / 2 - PADDLE_WIDTH / 2;

        // Fresh ball on paddle ready to launch
        const newBall = {
          id: generateId(),
          position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 90 },
          velocity: { dx: 0, dy: 0 },
          radius: BALL_RADIUS,
        };
        magnetBallRef.current = newBall;
ballsRef.current = [newBall];
setBalls([newBall]);

        aimAngleRef.current = -Math.PI / 2;

        
      } else {
        setMonsterFires(nextFires);
      }
    }



    // Update balls with sub-stepping for smoothness
    setBalls(prevBalls => {
      const newBalls = prevBalls.map(ball => {
        if (magnetBallRef.current && ball.id === magnetBallRef.current.id) {
          // Auto-release ball when auto-paddle is active + magnet
                    if (isAutoPaddle && performance.now() - levelStartTimeRef.current > ENTRANCE_MS + 400) {
            const releaseAngle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            magnetBallRef.current = null;
            return {
              ...ball,
              position: { x: paddle.x + paddle.width / 2, y: paddle.y - ball.radius - 1 },
              velocity: { dx: Math.cos(releaseAngle) * ballSpeed, dy: Math.sin(releaseAngle) * ballSpeed },
            };
          }
          return {
            ...ball,
            position: { x: paddle.x + paddle.width / 2, y: paddle.y - ball.radius - 1 },
            velocity: { dx: 0, dy: 0 },
          };
        }
        
        let { x, y } = ball.position;
        let { dx, dy } = ball.velocity;

        // Sub-step the ball movement for smoother physics
        for (let step = 0; step < numSteps; step++) {
          x += dx * stepDt;
          y += dy * stepDt;

          if (x - ball.radius < 0) {
            x = ball.radius;
            dx = Math.abs(dx);
            if (step === 0) { audioManager.playWallBounce(); impactVibrate(ball.radius); }
          }
          if (x + ball.radius > GAME_WIDTH) {
            x = GAME_WIDTH - ball.radius;
            dx = -Math.abs(dx);
            if (step === 0) { audioManager.playWallBounce(); impactVibrate(ball.radius); }
          }
          if (y - ball.radius < 0) {
            y = ball.radius;
            dy = Math.abs(dy);
            if (step === 0) { audioManager.playWallBounce(); impactVibrate(ball.radius); }
          }
        }

        // Ensure minimum vertical speed
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed > 0) {
          const minVerticalRatio = 0.25;
          const minVerticalSpeed = speed * minVerticalRatio;
          if (Math.abs(dy) < minVerticalSpeed) {
            const sign = dy >= 0 ? 1 : -1;
            dy = sign * minVerticalSpeed;
            const newDxMag = Math.sqrt(speed * speed - dy * dy);
            dx = dx >= 0 ? newDxMag : -newDxMag;
          }
        }

        // Track ball history for trail effect
        const history = ball.history ? [...ball.history, { x, y }] : [{ x, y }];
        // Keep last 12 positions for trail
        const trimmedHistory = history.length > 12 ? history.slice(-12) : history;

        return {
          ...ball,
          position: { x, y },
          velocity: { dx, dy },
          history: trimmedHistory,
        };
      });

      // Check for balls that fell off
      const aliveBalls = newBalls.filter(ball => {
        // Shield: ball bounces off blue shield line at bottom
        if (paddle.hasShield && ball.velocity.dy > 0 && ball.position.y + ball.radius >= GAME_HEIGHT - 15) {
          ball.position.y = GAME_HEIGHT - 15 - ball.radius;
          ball.velocity.dy = -Math.abs(ball.velocity.dy);
          createParticles(ball.position.x, GAME_HEIGHT - 15, 'hsl(200, 100%, 60%)', 10);
          return true;
        }
        
        if (ball.position.y < GAME_HEIGHT + 50) return true;
        return false;
      });
      
      if (aliveBalls.length === 0 && prevBalls.length > 0) {
        audioManager.playBallLost();
        setGameState(prev => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            setTimeout(() => onGameOver(), 100);
            return { ...prev, lives: 0, status: 'gameover' };
          }
          return { ...prev, lives: newLives };
        });
        
        // Reset ALL active powerups on ball loss
        setCombo(0);
        setComboTimer(0);
        setIsFireball(false);
        setIsBigBall(false);
        setIsShock(false);
        setIsAutoPaddle(false);
        setAutoPaddleEndTime(0);
autoPaddleEndTimeRef.current = 0;
shieldEndTimeRef.current = 0;
engineRef.current.isAutoPaddle = false;
paddleRef.current = {
  ...paddleRef.current,
  hasShield: false,
};

        setIsGhostPaddle(false);
        setPaddle(prev => ({
          ...prev,
          width: PADDLE_WIDTH,
          hasLaser: false,
          hasMagnet: false,
          hasShield: false,
        }));
        if (shieldTimerRef.current) {
          clearTimeout(shieldTimerRef.current);
          shieldTimerRef.current = null;
        }
        if (laserAutoFireRef.current) {
          clearInterval(laserAutoFireRef.current);
          laserAutoFireRef.current = null;
        }
        setLasers([]);
        
        magnetBallRef.current = {
          id: generateId(),
          position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 90 },
          velocity: { dx: 0, dy: 0 },
          radius: BALL_RADIUS,
        };
        return [magnetBallRef.current];
      }

      return aliveBalls;
    });

    // Check paddle collision
    setBalls(prevBalls => {
      return prevBalls.map(ball => {
        if (magnetBallRef.current?.id === ball.id) return ball;
        if (ball.velocity.dy <= 0) return ball;
        
        if (checkBallPaddleCollision(ball, paddle)) {
          const angle = calculateBounceAngle(ball, paddle);
          const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2) || ballSpeed;
          
          audioManager.playPaddleHit();
          createParticles(ball.position.x, ball.position.y, 'hsl(180, 100%, 50%)', 4);
          
          if (paddle.hasMagnet && !magnetBallRef.current) {
            magnetBallRef.current = ball;
            audioManager.playMagnetCatch();
            return {
              ...ball,
              position: { x: paddle.x + paddle.width / 2, y: paddle.y - ball.radius - 1 },
              velocity: { dx: 0, dy: 0 },
            };
          }
          
          let newDx = Math.sin(angle) * speed;
          let newDy = -Math.abs(Math.cos(angle) * speed);
          
          const minVert = speed * 0.3;
          if (Math.abs(newDy) < minVert) {
            newDy = -minVert;
            const newDxMag = Math.sqrt(speed * speed - newDy * newDy);
            newDx = newDx >= 0 ? newDxMag : -newDxMag;
          }
          
          return {
            ...ball,
            position: { ...ball.position, y: paddle.y - ball.radius - 2 },
            velocity: { dx: newDx, dy: newDy },
          };
        }
        return ball;
      });
    });

    // Update lasers
    setLasers(prevLasers => {
      return prevLasers
        .map(laser => ({ ...laser, y: laser.y - laser.speed * deltaTime }))
        .filter(laser => laser.y > 0);
    });

    // Check laser-brick collisions
    let laserDestroyedBrick = false;
if (!levelCompletingRef.current) {
setLasers(prevLasers => {
  return prevLasers.filter(laser => {
    for (const brick of bricks) {
      if (!brick.destroyed && checkLaserBrickCollision(laser, brick)) {
            setBricks(prev => {
              const updated = prev.map(b => {
                if (b.id === brick.id && b.type !== 'indestructible') {
                  const newHits = b.hits - 1;
                  if (newHits <= 0) {
                    const score = destroyBrick(b);
                    if (score) onScoreChange(gameState.score + score);
                    laserDestroyedBrick = true;
                    return { ...b, hits: 0, destroyed: true };
                  }
                  return { ...b, hits: newHits };
                }
                return b;
              });
              return updated;
            });
            createParticles(laser.x, laser.y, 'hsl(0, 100%, 50%)', 5);
            return false;
          }
        }
        return true;
      });
    });
}
    // Check brick collisions
    setBricks(prevBricks => {
      let scoreToAdd = 0;
      const ballsHitBricks = new Set<string>();
      
      const updatedBricks = prevBricks.map(brick => {
        if (brick.destroyed) return brick;
        
        // Ghost bricks: only breakable when visible (phase 0 = visible)
        const isGhostInvisible = brick.type === 'ghost' && Math.floor(gameTime) % 2 === 1;

        for (const ball of balls) {
          if (ballsHitBricks.has(ball.id)) continue;
          
          if (checkBallBrickCollision(ball, brick)) {
            // Ghost bricks: ball passes through when invisible
            if (isGhostInvisible) continue;
            
            if (!isFireball && !isBigBall) {
              ballsHitBricks.add(ball.id);
            }
            
            if (brick.type === 'indestructible') {
              createParticles(ball.position.x, ball.position.y, 'hsl(220, 20%, 60%)', 3);
              return brick;
            }
            
            impactVibrate(ball.radius);
            
            const newHits = brick.hits - ((isFireball || isBigBall) ? brick.hits : 1);
            
            if (newHits <= 0) {
              const score = destroyBrick(brick);
              if (score) scoreToAdd += score;
              
              if (brick.type === 'chain') {
                const chainedBricks = getChainedBricks(brick, prevBricks);
                chainedBricks.forEach(cb => {
                  if (cb.id !== brick.id && !cb.destroyed) {
                    const chainScore = destroyBrick(cb);
                    if (chainScore) scoreToAdd += chainScore;
                  }
                });
              }
              
              // Shock: destroy adjacent bricks
              if (isShock) {
                const brickCenterX = brick.x + brick.width / 2;
                const brickCenterY = brick.y + brick.height / 2;
                
                prevBricks.forEach(nearbyBrick => {
                  if (nearbyBrick.id !== brick.id && !nearbyBrick.destroyed && nearbyBrick.type !== 'indestructible') {
                    const gapX = Math.abs(nearbyBrick.x + nearbyBrick.width / 2 - brickCenterX) - (brick.width / 2 + nearbyBrick.width / 2);
                    const gapY = Math.abs(nearbyBrick.y + nearbyBrick.height / 2 - brickCenterY) - (brick.height / 2 + nearbyBrick.height / 2);
                    
                    if (gapX <= 5 && gapY <= 5) {
                      nearbyBrick.destroyed = true;
                      nearbyBrick.hits = 0;
                      const shockScore = destroyBrick(nearbyBrick);
                      if (shockScore) scoreToAdd += shockScore;
                      createParticles(nearbyBrick.x + nearbyBrick.width / 2, nearbyBrick.y + nearbyBrick.height / 2, 'hsl(55, 100%, 60%)', 8);
                    }
                  }
                });
              }
              
              return { ...brick, hits: 0, destroyed: true };
            }
            
            scoreToAdd += 5;
            createParticles(
              brick.x + brick.width / 2,
              brick.y + brick.height / 2,
              getBrickColor(brick.color),
              4
            );
            
            return { ...brick, hits: newHits };
          }
        }
        return brick;
      });

      // Electric ball: side arcs destroy bricks LEFT and RIGHT only, NOT front/back
      // Ball still bounces off front bricks normally (handled by collision response below)
      if (isShock && !levelCompletingRef.current) {
        balls.forEach(ball => {
          if (ball.velocity.dx === 0 && ball.velocity.dy === 0) return;
          
          updatedBricks.forEach((brick, idx) => {
            if (brick.destroyed || brick.type === 'indestructible') return;
            // Skip bricks already hit by normal front collision this frame
            if (ballsHitBricks.has(ball.id) && checkBallBrickCollision(ball, brick)) return;
            
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;
            
            const dx = brickCenterX - ball.position.x;
            const dy = brickCenterY - ball.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // Side arc ONLY: within 45px, brick must be more horizontal than vertical from ball
            // Math.abs(dx) > Math.abs(dy) ensures only LEFT/RIGHT sides, not front/back
            if (dist < 45 + ball.radius && Math.abs(dx) > Math.abs(dy) * 0.8 && Math.abs(dx) > ball.radius) {
              const score = destroyBrick(brick);
              if (score) scoreToAdd += score;
              updatedBricks[idx] = { ...brick, destroyed: true, hits: 0 };
              
              createParticles(brickCenterX, brickCenterY, 'hsl(200, 100%, 70%)', 6);
              createParticles(brickCenterX, brickCenterY, 'hsl(50, 100%, 60%)', 4);
            }
          });
        });
      }

      // Handle explosions affecting bricks
      if (explosions.length > 0 && !levelCompletingRef.current) {
explosions.forEach(explosion => {
        const affectedBricks = getBricksInExplosionRadius(
          { x: explosion.x, y: explosion.y, radius: explosion.maxRadius * 0.8 },
          updatedBricks
        );
        affectedBricks.forEach(brick => {
          const brickIndex = updatedBricks.findIndex(b => b.id === brick.id);
          if (brickIndex !== -1 && !updatedBricks[brickIndex].destroyed) {
            const score = destroyBrick(updatedBricks[brickIndex]);
            if (score) scoreToAdd += score;
            updatedBricks[brickIndex] = { ...updatedBricks[brickIndex], destroyed: true, hits: 0 };
          }
        });
      });
      }
      // Check ball-level coin collisions
      setLevelCoins(prevCoins => {
        return prevCoins.map(coin => {
          if (coin.collected) return coin;
          
          for (const ball of balls) {
            const dx = ball.position.x - coin.x;
            const dy = ball.position.y - coin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius + 12) {
                            // Reduced coin value from coin.value to 1
              if(Math.random() < 0.05) { setGameState(prev => ({ ...prev, coins: prev.coins + 1 })); }
              createParticles(coin.x, coin.y, 'hsl(45, 100%, 55%)', 10);
              audioManager.playCoinCollect();
              return { ...coin, collected: true };
            }
          }
          return coin;
        });
      });

      if (scoreToAdd > 0) {
        onScoreChange(gameState.score + Math.round(scoreToAdd));
      }

      return updatedBricks;
    });

    // Ball-brick collision response
    setBalls(prevBalls => {
      return prevBalls.map(ball => {
        for (const brick of bricks) {
          if (!brick.destroyed && checkBallBrickCollision(ball, brick)) {
            const ballCenterX = ball.position.x;
            const ballCenterY = ball.position.y;
            const brickCenterX = brick.x + brick.width / 2;
            const brickCenterY = brick.y + brick.height / 2;
            
            const dx = ballCenterX - brickCenterX;
            const dy = ballCenterY - brickCenterY;
            
            const overlapX = (ball.radius + brick.width / 2) - Math.abs(dx);
            const overlapY = (ball.radius + brick.height / 2) - Math.abs(dy);
            
            // Electric ball (isShock) bounces normally - does NOT pass through
            if (!isFireball) {
              if (overlapX < overlapY) {
                return {
                  ...ball,
                  velocity: { ...ball.velocity, dx: dx > 0 ? Math.abs(ball.velocity.dx) : -Math.abs(ball.velocity.dx) },
                };
              } else {
                return {
                  ...ball,
                  velocity: { ...ball.velocity, dy: dy > 0 ? Math.abs(ball.velocity.dy) : -Math.abs(ball.velocity.dy) },
                };
              }
            }
          }
        }
        return ball;
      });
    });

    // Update power-ups
    setPowerUps(prevPowerUps => {
      return prevPowerUps.filter(powerUp => {
        const newY = powerUp.y + powerUp.velocity * deltaTime;
        // Clamp powerup X to screen bounds
        if (powerUp.x < 0) powerUp.x = 0;
        if (powerUp.x + powerUp.width > GAME_WIDTH) powerUp.x = GAME_WIDTH - powerUp.width;
        
        if (
          newY + powerUp.height > paddle.y &&
          newY < paddle.y + paddle.height &&
          powerUp.x + powerUp.width > paddle.x &&
          powerUp.x < paddle.x + paddle.width
        ) {
          switch (powerUp.type) {
            case 'widen':
              setPaddle(prev => ({ ...prev, width: Math.min(150, prev.width + 30) }));
              setTimeout(() => setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH })), 10000);
              break;
            case 'shrink':
              setPaddle(prev => ({ ...prev, width: Math.max(40, prev.width - 20) }));
              setTimeout(() => setPaddle(prev => ({ ...prev, width: PADDLE_WIDTH })), 10000);
              break;
            case 'multiball': {
              setBalls(prev => {
                const newBalls: Ball[] = [];
                prev.forEach(ball => {
                  const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2) || ballSpeed;
                  newBalls.push(ball);
                  newBalls.push({
                    ...ball,
                    id: generateId(),
                    velocity: {
                      dx: (Math.random() - 0.5) * speed * 0.4,
                      dy: -Math.abs(speed),
                    },
                  });
                });
                return newBalls;
              });
              break;
            }
            case 'sevenball': {
              setBalls(prev => {
                const newBalls: Ball[] = [];
                prev.forEach(ball => {
                  const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2) || ballSpeed;
                  newBalls.push(ball);
                  for (let i = 0; i < 6; i++) {
                    const spreadAngle = ((i - 2.5) / 2.5) * (Math.PI * 0.35);
                    newBalls.push({
                      id: generateId(),
                      position: { ...ball.position },
                      velocity: {
                        dx: Math.sin(spreadAngle) * speed,
                        dy: -Math.abs(Math.cos(spreadAngle) * speed),
                      },
                      radius: ball.radius,
                    });
                  }
                });
                return newBalls;
              });
              break;
            }
            case 'bigball':
              setBalls(prev => prev.map(ball => ({
                ...ball,
                radius: BALL_RADIUS * 1.8,
              })));
                            setIsBigBall(true);
              isBigBallActive = true;
              setTimeout(() => {
                setBalls(prev => prev.map(ball => ({
                  ...ball,
                  radius: BALL_RADIUS,
                })));
                setIsBigBall(false);
                isBigBallActive = false;
              }, 15000);
              break;
            case 'slow':
              setBalls(prev => prev.map(ball => ({
                ...ball,
                velocity: {
                  dx: ball.velocity.dx * 0.7,
                  dy: ball.velocity.dy * 0.7,
                },
              })));
              setTimeout(() => {
                setBalls(prev => prev.map(ball => {
                  const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2);
                  if (speed === 0) return ball;
                  const factor = ballSpeed / speed;
                  return { ...ball, velocity: { dx: ball.velocity.dx * factor, dy: ball.velocity.dy * factor } };
                }));
              }, 15000);
              break;
            case 'speedup':
              setBalls(prev => prev.map(ball => ({
                ...ball,
                velocity: {
                  dx: ball.velocity.dx * 1.3,
                  dy: ball.velocity.dy * 1.3,
                },
              })));
              setTimeout(() => {
                setBalls(prev => prev.map(ball => {
                  const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2);
                  if (speed === 0) return ball;
                  const factor = ballSpeed / speed;
                  return { ...ball, velocity: { dx: ball.velocity.dx * factor, dy: ball.velocity.dy * factor } };
                }));
              }, 15000);
              break;
            case 'extralife':
              setGameState(prev => ({ ...prev, lives: prev.lives + 1 }));
              audioManager.playExtraLife();
              break;
            case 'fireball':
              setIsFireball(true);
              if ((window as any).__fireballTimer) clearTimeout((window as any).__fireballTimer);
              (window as any).__fireballTimer = setTimeout(() => setIsFireball(false), 10000);
              break;
            case 'laser':
              setPaddle(prev => ({ ...prev, hasLaser: true }));
              setTimeout(() => setPaddle(prev => ({ ...prev, hasLaser: false })), 7000);
              break;
            case 'magnet':
              setPaddle(prev => ({ ...prev, hasMagnet: true }));
              setTimeout(() => setPaddle(prev => ({ ...prev, hasMagnet: false })), 10000);
              break;
            case 'shield': {
  const endTime = nextGameTime + 15;
  shieldEndTimeRef.current = endTime;

  // Update the live paddle immediately for the current physics tick.
  paddleRef.current = {
    ...paddleRef.current,
    hasShield: true,
  };

  // React mirrors the value for rendering/HUD only.
  setPaddle(prev => ({ ...prev, hasShield: true }));
  setShieldEndTime(endTime);
  break;
}

            case 'autopaddle': {
  const endTime = nextGameTime + 15;

  engineRef.current.isAutoPaddle = true;
  autoPaddleEndTimeRef.current = endTime;
  userOverrideRef.current = false;

  // React mirrors the value for the HUD; the engine ref is authoritative.
  setIsAutoPaddle(true);
  setAutoPaddleEndTime(endTime);
  break;
}

            case 'shock':
              setIsShock(true);
              if ((window as any).__shockTimer) clearTimeout((window as any).__shockTimer);
              (window as any).__shockTimer = setTimeout(() => setIsShock(false), 10000);
              break;
            case 'ghost':
              setIsGhostPaddle(true);
              setGhostEndTime(gameTime + 15);
              setTimeout(() => {
                setIsGhostPaddle(false);
                setGhostEndTime(0);
              }, 15000);
              break;
          }
          
          const color = getPowerUpColor(powerUp.type);
          createParticles(powerUp.x + powerUp.width / 2, powerUp.y, color, 10);
          
          if (isNegativePowerUp(powerUp.type)) {
            audioManager.playPowerDown();
          } else {
            audioManager.playPowerUp();
          }
          
          return false;
        }
        
        if (newY > GAME_HEIGHT) return false;
        
        powerUp.y = newY;
        return true;
      });
    });

    // Update coins
    setCoins(prevCoins => {
      return prevCoins.filter(coin => {
        const newY = coin.y + coin.velocity * deltaTime;
        
        if (
          newY + 15 > paddle.y &&
          newY < paddle.y + paddle.height &&
          coin.x + 10 > paddle.x &&
          coin.x - 10 < paddle.x + paddle.width
        ) {
                    // Reduced coin value from coin.value to 1
          if(Math.random() < 0.05) { setGameState(prev => ({ ...prev, coins: prev.coins + 1 })); }
          createParticles(coin.x, coin.y, 'hsl(45, 100%, 55%)', 8);
          audioManager.playCoinCollect();
          return false;
        }
        
        if (newY > GAME_HEIGHT) return false;
        
        coin.y = newY;
        return true;
      });
    });

    // Update explosions
    setExplosions(prevExplosions => {
      return prevExplosions
        .map(explosion => ({
          ...explosion,
          radius: explosion.radius + deltaTime * 400,
          life: explosion.life - deltaTime * 2,
        }))
        .filter(explosion => explosion.life > 0);
    });

    // Update particles (skip entirely when there are none - avoids a React
    // commit + array allocation on every single frame)
    if (particleCountRef.current > 0) setParticles(prevParticles => {
      const next = prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.dx * deltaTime,
          y: particle.y + particle.dy * deltaTime,
          dy: particle.dy + 200 * deltaTime,
          life: particle.life - deltaTime * 2,
        }))
        .filter(particle => particle.life > 0);
      particleCountRef.current = next.length;
      return next;
    });

    // Update alien ships
    if (alienShips.length > 0 && !levelCompletingRef.current) {
      setAlienShips(prev => {
        let scoreToAdd = 0;
        let updated = updateAlienShips(prev, deltaTime);

        // Check ball-ship collisions
        updated = updated.map(ship => {
          if (ship.hp <= 0) return ship;
          for (const ball of balls) {
            if (checkBallShipCollision(ball.position.x, ball.position.y, ball.radius, ship)) {
              const newHp = ship.hp - (isFireball ? 3 : 1);
              createParticles(ship.x + ship.width / 2, ship.y + ship.height / 2, ship.color, 8);
              if (newHp <= 0) {
                scoreToAdd += getShipScore(ship);
                createParticles(ship.x + ship.width / 2, ship.y + ship.height / 2, '#ffaa00', 15);
                triggerScreenShake(ship.type === 'boss' ? 12 : 5);
                // Drop a power-up from destroyed ship
                const powerUp = createPowerUp(ship.x + ship.width / 2, ship.y + ship.height);
                setPowerUps(p => [...p, powerUp]);
              }
              return { ...ship, hp: Math.max(0, newHp), hitFlash: 1 };
            }
          }
          return ship;
        });

        // Check laser-ship collisions
        setLasers(prevLasers => {
          return prevLasers.filter(laser => {
            for (let i = 0; i < updated.length; i++) {
              const ship = updated[i];
              if (ship.hp <= 0) continue;
              if (checkLaserShipCollision(laser.x, laser.y, ship)) {
                const newHp = ship.hp - 1;
                createParticles(laser.x, laser.y, '#ff4444', 5);
                if (newHp <= 0) {
                  scoreToAdd += getShipScore(ship);
                  createParticles(ship.x + ship.width / 2, ship.y + ship.height / 2, '#ffaa00', 15);
                  triggerScreenShake(ship.type === 'boss' ? 12 : 5);
                  const powerUp = createPowerUp(ship.x + ship.width / 2, ship.y + ship.height);
                  setPowerUps(p => [...p, powerUp]);
                }
                updated[i] = { ...ship, hp: Math.max(0, newHp), hitFlash: 1 };
                return false;
              }
            }
            return true;
          });
        });

        // Ships no longer shoot bullets - they are just obstacles to destroy

        if (scoreToAdd > 0) {
          onScoreChange(gameState.score + scoreToAdd);
        }

        // Remove destroyed ships (keep for a frame to render explosion)
        return updated.filter(s => s.hp > 0 || s.hitFlash > 0);
      });
    }

    // Update alien bullets
    if (alienBullets.length > 0) {
      setAlienBullets(prev => {
        return prev.filter(bullet => {
          bullet.y += bullet.speed * deltaTime;
          if (bullet.y > GAME_HEIGHT) return false;

          // Check if bullet hits paddle
          if (
            bullet.y + bullet.height >= paddle.y &&
            bullet.y <= paddle.y + paddle.height &&
            bullet.x + bullet.width >= paddle.x &&
            bullet.x <= paddle.x + paddle.width
          ) {
            // Shield blocks bullets
            if (paddle.hasShield) {
              createParticles(bullet.x, bullet.y, 'hsl(200, 100%, 60%)', 5);
              return false;
            }
            // Lose a life
            createParticles(bullet.x, bullet.y, '#ff4444', 8);
            triggerScreenShake(6);
            setGameState(prev => {
              const newLives = prev.lives - 1;
              if (newLives <= 0) {
                setTimeout(() => onGameOver(), 100);
                return { ...prev, lives: 0, status: 'gameover' };
              }
              return { ...prev, lives: newLives };
            });
            return false;
          }
          return true;
        });
      });
    }
  }, [paddle, balls, bricks, alienShips, alienBullets, gameState.score, gameState.level, ballSpeed, isFireball, isBigBall, isShock, isAutoPaddle, autoPaddleEndTime, isGhostPaddle, shieldEndTime, ghostEndTime, explosions, createParticles, destroyBrick, onScoreChange, onLevelComplete, onGameOver, setGameState, plane, lastPowerUpTime, gameTime, levelCoins]);

  useGameLoop(gameLoop, gameState.status === 'playing');

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform fully to prevent drift between frames
    ctx.setTransform(1, 0, 0, 1, 0, 0);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw cached background (image + darkening gradient + static stars).
    // Rebuilt only when size/dpr changes or the image finishes loading —
    // avoids per-frame gradient allocation and 50-arc star loop that was
    // spiking CPU and heating the phone.
    const canvasWidth = ctx.canvas.width / dpr;
    const canvasHeight = ctx.canvas.height / dpr;

    const cache = bgCacheRef.current;
    const cacheSize = bgCacheSizeRef.current;
    const needsRebuild =
      !cache ||
      !cacheSize ||
      cacheSize.w !== canvasWidth ||
      cacheSize.h !== canvasHeight ||
      cacheSize.dpr !== dpr ||
      (cache && !cache.dataset?.hasImage && bgImageRef.current);

    if (needsRebuild) {
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.floor(canvasWidth * dpr));
      off.height = Math.max(1, Math.floor(canvasHeight * dpr));
      const octx = off.getContext('2d');
      if (octx) {
        octx.scale(dpr, dpr);
        if (bgImageRef.current) {
          const img = bgImageRef.current;
          const canvasAspect = canvasWidth / canvasHeight;
          const imgAspect = img.width / img.height;
          let drawW, drawH, drawX, drawY;
          if (imgAspect > canvasAspect) {
            drawH = canvasHeight;
            drawW = canvasHeight * imgAspect;
            drawX = (canvasWidth - drawW) / 2;
            drawY = 0;
          } else {
            drawW = canvasWidth;
            drawH = canvasWidth / imgAspect;
            drawX = 0;
            drawY = (canvasHeight - drawH) / 2;
          }
          octx.drawImage(img, drawX, drawY, drawW, drawH);

          const cx = canvasWidth / 2;
          const cy = canvasHeight / 2;
          const rMax = Math.hypot(cx, cy);
          const grad = octx.createRadialGradient(cx, cy, 0, cx, cy, rMax);
          grad.addColorStop(0.0, 'rgba(0, 0, 0, 0.32)');
          grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.18)');
          grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.05)');
          octx.fillStyle = grad;
          octx.fillRect(0, 0, canvasWidth, canvasHeight);
          off.dataset.hasImage = '1';
        } else {
          octx.fillStyle = '#0a0a1a';
          octx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        octx.fillStyle = 'white';
        octx.globalAlpha = 0.6;
        for (let i = 0; i < 50; i++) {
          const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * canvasWidth;
          const y = (Math.cos(i * 678.90) * 0.5 + 0.5) * canvasHeight;
          const size = (i % 3) + 0.5;
          octx.beginPath();
          octx.arc(x, y, size, 0, Math.PI * 2);
          octx.fill();
        }
        octx.globalAlpha = 1;
      }
      bgCacheRef.current = off;
      bgCacheSizeRef.current = { w: canvasWidth, h: canvasHeight, dpr };
    }

    const bg = bgCacheRef.current;
    if (bg) {
      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // Apply screen shake ONLY to game elements (not background)
    ctx.save();
    if (screenShake > 0) {
      const shakeX = Math.max(-5, Math.min(5, (Math.random() - 0.5) * screenShake));
      const shakeY = Math.max(-5, Math.min(5, (Math.random() - 0.5) * screenShake));
      ctx.translate(shakeX, shakeY);
    }

    // Draw shield - solid blue line that bounces ball
    if (paddle.hasShield) {
      ctx.save();
      ctx.shadowColor = 'hsl(200, 100%, 60%)';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'hsl(200, 100%, 70%)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GAME_HEIGHT - 15);
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 15);
      ctx.stroke();
      // Wider glow
      ctx.strokeStyle = 'hsla(200, 100%, 60%, 0.3)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(0, GAME_HEIGHT - 15);
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - 15);
      ctx.stroke();
      ctx.restore();
    }

    // Draw rocket/plane with monkey
    if (plane) {
      ctx.save();
      ctx.translate(plane.x, plane.y);
      
      // Rocket flame/exhaust
      const flameFlicker = Math.sin(gameTime * 20) * 3;
      ctx.fillStyle = 'hsl(25, 100%, 55%)';
      ctx.beginPath();
      ctx.moveTo(-28, -5);
      ctx.lineTo(-40 - flameFlicker, 0);
      ctx.lineTo(-28, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'hsl(40, 100%, 65%)';
      ctx.beginPath();
      ctx.moveTo(-28, -3);
      ctx.lineTo(-35 - flameFlicker * 0.7, 0);
      ctx.lineTo(-28, 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'hsl(55, 100%, 85%)';
      ctx.beginPath();
      ctx.moveTo(-28, -1.5);
      ctx.lineTo(-31 - flameFlicker * 0.3, 0);
      ctx.lineTo(-28, 1.5);
      ctx.closePath();
      ctx.fill();
      
      // Rocket body
      const bodyGrad = ctx.createLinearGradient(0, -12, 0, 12);
      bodyGrad.addColorStop(0, 'hsl(210, 15%, 88%)');
      bodyGrad.addColorStop(0.25, 'hsl(215, 12%, 72%)');
      bodyGrad.addColorStop(0.6, 'hsl(220, 15%, 52%)');
      bodyGrad.addColorStop(1, 'hsl(225, 20%, 35%)');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(32, 0);
      ctx.quadraticCurveTo(28, -10, -26, -10);
      ctx.lineTo(-26, 10);
      ctx.quadraticCurveTo(28, 10, 32, 0);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = 'hsl(0, 80%, 55%)';
      ctx.beginPath();
      ctx.roundRect(-20, -10, 8, 20, 0);
      ctx.fill();
      
      // Cockpit window
      const cockpitGrad = ctx.createRadialGradient(16, -3, 0, 16, -3, 8);
      cockpitGrad.addColorStop(0, 'hsl(195, 100%, 88%)');
      cockpitGrad.addColorStop(0.5, 'hsl(200, 90%, 62%)');
      cockpitGrad.addColorStop(1, 'hsl(210, 80%, 42%)');
      ctx.fillStyle = cockpitGrad;
      ctx.beginPath();
      ctx.ellipse(16, -1, 9, 6, 0, -Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(13, -4, 4, 2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Fins
      ctx.fillStyle = 'hsl(220, 70%, 45%)';
      ctx.beginPath();
      ctx.moveTo(-16, -10);
      ctx.lineTo(-24, -22);
      ctx.lineTo(-8, -10);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-16, 10);
      ctx.lineTo(-24, 22);
      ctx.lineTo(-8, 10);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, -2);
      ctx.quadraticCurveTo(22, -9, -22, -9);
      ctx.stroke();

      // === MONKEY with throw animation ===
      const throwAnim = planeThrowAnimRef.current;
      const isThrowingOrJustThrew = throwAnim > 0;
      const throwProgress = 1 - throwAnim; // 0 = just threw, 1 = fully recovered
      
      // Monkey body (brown)
      ctx.fillStyle = 'hsl(25, 60%, 40%)';
      ctx.beginPath();
      ctx.ellipse(8, -18, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Monkey head
      ctx.fillStyle = 'hsl(25, 55%, 45%)';
      ctx.beginPath();
      ctx.arc(8, -27, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Monkey face (lighter)
      ctx.fillStyle = 'hsl(28, 50%, 62%)';
      ctx.beginPath();
      ctx.ellipse(8, -25, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Monkey eyes
      ctx.fillStyle = 'hsl(240, 30%, 15%)';
      ctx.beginPath();
      ctx.arc(5, -28, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(11, -28, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(5.6, -28.5, 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(11.6, -28.5, 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      // Monkey mouth - BIG SMILE when throwing!
      if (isThrowingOrJustThrew) {
        // Big funny smile during throw
        ctx.fillStyle = 'hsl(240, 30%, 15%)';
        ctx.beginPath();
        ctx.arc(8, -23, 4, 0, Math.PI);
        ctx.fill();
        // White teeth
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(8, -23, 3, 0.1, Math.PI - 0.1);
        ctx.fill();
        // Tongue
        ctx.fillStyle = 'hsl(0, 70%, 55%)';
        ctx.beginPath();
        ctx.ellipse(8, -21, 2, 1.5, 0, 0, Math.PI);
        ctx.fill();
      } else {
        // Normal smile
        ctx.strokeStyle = 'hsl(240, 30%, 20%)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(8, -24, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      
      // Monkey ears
      ctx.fillStyle = 'hsl(25, 55%, 45%)';
      ctx.beginPath();
      ctx.arc(0, -27, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16, -27, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'hsl(350, 50%, 65%)';
      ctx.beginPath();
      ctx.arc(0, -27, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16, -27, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Monkey arms - animate throw!
      ctx.strokeStyle = 'hsl(25, 55%, 40%)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      if (isThrowingOrJustThrew) {
        // Throwing animation - arms swing forward and down
        const armAngle = Math.sin(throwProgress * Math.PI) * 0.8;
        // Left arm swinging forward
        ctx.beginPath();
        ctx.moveTo(2, -16);
        ctx.lineTo(-3 + Math.sin(armAngle) * 15, -8 + Math.cos(armAngle) * 12);
        ctx.stroke();
        // Right arm swinging forward
        ctx.beginPath();
        ctx.moveTo(14, -16);
        ctx.lineTo(19 + Math.sin(armAngle) * 15, -8 + Math.cos(armAngle) * 12);
        ctx.stroke();
      } else {
        // Normal arms holding position
        ctx.beginPath();
        ctx.moveTo(2, -16);
        ctx.lineTo(-3, -8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(14, -16);
        ctx.lineTo(19, -8);
        ctx.stroke();
      }
      
      // Power-up package
      if (plane.hasPowerUp) {
        ctx.shadowColor = 'hsl(50, 100%, 60%)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'hsl(50, 100%, 55%)';
        ctx.beginPath();
        ctx.roundRect(-4, 8, 14, 10, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'hsl(0, 80%, 55%)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(3, 8); ctx.lineTo(3, 18);
        ctx.moveTo(-4, 13); ctx.lineTo(10, 13);
        ctx.stroke();
        ctx.fillStyle = 'hsl(0, 80%, 60%)';
        ctx.beginPath();
        ctx.ellipse(1, 8, 3, 2, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(5, 8, 3, 2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }

    // Draw level coins
    levelCoins.forEach(coin => {
      if (coin.collected) return;
      
      const pulse = 1 + Math.sin(gameTime * 4) * 0.1;
      
      ctx.fillStyle = 'hsl(45, 100%, 55%)';
      ctx.shadowColor = 'hsl(45, 100%, 55%)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 10 * pulse, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = 'hsl(35, 100%, 40%)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 6 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.fillStyle = 'hsl(35, 100%, 35%)';
      ctx.font = 'bold 10px Rajdhani';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', coin.x, coin.y);
      ctx.shadowBlur = 0;
    });

    // Draw explosions
    explosions.forEach(explosion => {
      const gradient = ctx.createRadialGradient(
        explosion.x, explosion.y, 0,
        explosion.x, explosion.y, explosion.radius
      );
      gradient.addColorStop(0, `hsla(50, 100%, 70%, ${explosion.life * 0.8})`);
      gradient.addColorStop(0.3, `hsla(25, 100%, 55%, ${explosion.life * 0.6})`);
      gradient.addColorStop(0.7, `hsla(0, 100%, 50%, ${explosion.life * 0.3})`);
      gradient.addColorStop(1, 'hsla(0, 100%, 50%, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Alien ships removed

    // Draw bricks with premium 3D rendering.
    // #1/#5: Ghost bricks always render fully — no alpha oscillation — so the
    // background stays visually stable. Collision toggling (pass-through) is
    // handled separately in the physics step.
    const entranceT = Math.min(1, (performance.now() - levelStartTimeRef.current) / ENTRANCE_MS);

    if (isMonster) {
      // Boss body: paint the monster artwork onto the surviving brick chunks
      const img = getMonsterImage(gameState.level);
      const alive = bricks.filter(b => !b.destroyed);
      const bodyDx = alive.length ? alive[0].x - (alive[0].originalX ?? alive[0].x) : 0;
      const ready = img.complete && img.naturalWidth > 0;

      bricks.forEach(brick => {
        if (brick.destroyed) return;
        const col = Math.round(((brick.originalX ?? brick.x) - MONSTER_START_X) / MONSTER_BRICK_WIDTH);
        const row = Math.round((brick.y - MONSTER_START_Y) / MONSTER_BRICK_HEIGHT);
        if (!ready || col < 0 || row < 0 || col >= MONSTER_COLS || row >= MONSTER_ROWS) {
          drawPremiumBrick(ctx, brick, gameTime);
          return;
        }
        const sw = img.naturalWidth / MONSTER_COLS;
        const sh = img.naturalHeight / MONSTER_ROWS;
        ctx.save();
        ctx.beginPath();
        ctx.rect(brick.x, brick.y, brick.width, brick.height);
        ctx.clip();
        ctx.drawImage(
          img,
          col * sw, row * sh, sw, sh,
          brick.x, brick.y, brick.width, brick.height
        );
        // Damage shading as the chunk gets hit
        const dmg = 1 - brick.hits / Math.max(1, brick.maxHits);
        if (dmg > 0) {
          ctx.fillStyle = `rgba(255,40,40,${dmg * 0.35})`;
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(brick.x + 0.5, brick.y + 0.5, brick.width - 1, brick.height - 1);
        ctx.restore();
      });

      // Glowing danger frame around the whole boss body
      if (alive.length) {
        const ratio = monsterHp.max ? monsterHp.current / monsterHp.max : 1;
        const enraged = ratio <= 0.25;
        ctx.save();
        ctx.globalAlpha = 0.5 + Math.sin(gameTime * (enraged ? 12 : 5)) * 0.25;
        ctx.strokeStyle = enraged ? 'hsl(0, 100%, 60%)' : 'hsl(0, 90%, 45%)';
        ctx.shadowColor = 'hsl(0, 100%, 55%)';
        ctx.shadowBlur = enraged ? 30 : 18;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(
          MONSTER_START_X + bodyDx - 5, MONSTER_START_Y - 5,
          MONSTER_BODY_WIDTH + 10, MONSTER_BODY_HEIGHT + 10, 10
        );
        ctx.stroke();
        ctx.restore();
      }
    } else {
      bricks.forEach(brick => {
        if (brick.destroyed) return;
        if (entranceT < 1) {
          // Fall-in entrance: each brick drops from above and settles
          const delay = (((brick.y * 0.6 + brick.x * 0.4) % 260) / 260) * 0.35;
          const p = Math.max(0, Math.min(1, (entranceT - delay) / (1 - delay)));
          const offset = -(brick.y + 120) * (1 - easeOutCubic(p));
          if (p <= 0) return;
          ctx.save();
          ctx.globalAlpha = Math.min(1, p * 2);
          ctx.translate(0, offset);
          drawPremiumBrick(ctx, brick, gameTime);
          ctx.restore();
        } else {
          drawPremiumBrick(ctx, brick, gameTime);
        }
      });
    }

        // Boss fireballs — bigger + live flame
    monsterFires.forEach(f => {
      const r = 22;
      ctx.save();
      const g = ctx.createRadialGradient(f.x, f.y, 2, f.x, f.y, r);
      g.addColorStop(0, 'hsla(50, 100%, 80%, 1)');
      g.addColorStop(0.25, 'hsla(30, 100%, 55%, 0.95)');
      g.addColorStop(0.55, 'hsla(15, 100%, 45%, 0.7)');
      g.addColorStop(1, 'hsla(0, 100%, 30%, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = 'hsl(20, 100%, 50%)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = 'hsl(45, 100%, 75%)';
      ctx.beginPath();
      ctx.arc(f.x, f.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.5 + Math.random() * 0.4;
      ctx.fillStyle = 'hsl(10, 100%, 55%)';
      ctx.beginPath();
      ctx.arc(f.x + (Math.random() - 0.5) * 6, f.y + (Math.random() - 0.5) * 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // ===== MONSTER (BOSS) LEVEL OVERLAY =====
    if (isMonster && monsterHp.max > 0) {
      const alive = bricks.filter(b => !b.destroyed);
      if (alive.length > 0) {
        const ratio = Math.max(0, Math.min(1, monsterHp.current / monsterHp.max));

        // Enrage: red lightning storm when the boss is nearly dead
        if (ratio <= 0.25) {
          ctx.save();
          ctx.globalAlpha = 0.12 + Math.random() * 0.18;
          ctx.fillStyle = 'hsl(0, 100%, 30%)';
          ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
          ctx.globalAlpha = 0.8;
          ctx.strokeStyle = 'hsl(0, 100%, 70%)';
          ctx.shadowColor = 'hsl(0, 100%, 60%)';
          ctx.shadowBlur = 16;
          ctx.lineWidth = 2;
          for (let b = 0; b < 2; b++) {
            let lx = 30 + Math.random() * (GAME_WIDTH - 60);
            let ly = 0;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            while (ly < GAME_HEIGHT * 0.55) {
              lx += (Math.random() - 0.5) * 40;
              ly += 25 + Math.random() * 30;
              ctx.lineTo(lx, ly);
            }
            ctx.stroke();
          }
          ctx.restore();
        }

        // HP bar at the very top
        const barW = GAME_WIDTH - 40;
        const barX = 20;
        const barY = 8;
        const barH = 14;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.beginPath();
        ctx.roundRect(barX - 2, barY - 2, barW + 4, barH + 4, 9);
        ctx.fill();

        const hpGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        if (ratio > 0.5) {
          hpGrad.addColorStop(0, 'hsl(140, 100%, 55%)');
          hpGrad.addColorStop(1, 'hsl(90, 100%, 50%)');
        } else if (ratio > 0.25) {
          hpGrad.addColorStop(0, 'hsl(45, 100%, 60%)');
          hpGrad.addColorStop(1, 'hsl(30, 100%, 55%)');
        } else {
          hpGrad.addColorStop(0, 'hsl(0, 100%, 60%)');
          hpGrad.addColorStop(1, 'hsl(15, 100%, 50%)');
        }
        ctx.fillStyle = hpGrad;
        ctx.shadowColor = ratio > 0.25 ? 'transparent' : 'hsl(0, 100%, 55%)';
        ctx.shadowBlur = ratio > 0.25 ? 0 : 12;
        ctx.beginPath();
        ctx.roundRect(barX, barY, Math.max(2, barW * ratio), barH, 7);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 7);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          `${getMonsterName(gameState.level)}  ${monsterHp.current}/${monsterHp.max}`,
          GAME_WIDTH / 2,
          barY + barH / 2 + 0.5
        );
        ctx.restore();
      }

      // Red lightning intro for the first 2.2 seconds of a monster level
      const elapsed = (performance.now() - levelStartTimeRef.current) / 1000;
      if (elapsed < 2.2) {
        const fade = 1 - elapsed / 2.2;
        ctx.save();
        ctx.globalAlpha = fade * (0.25 + Math.random() * 0.35);
        ctx.fillStyle = 'hsl(0, 100%, 30%)';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        ctx.globalAlpha = fade;
        ctx.strokeStyle = 'hsl(0, 100%, 70%)';
        ctx.shadowColor = 'hsl(0, 100%, 60%)';
        ctx.shadowBlur = 18;
        ctx.lineWidth = 2.5;
        const bolts = 2;
        for (let b = 0; b < bolts; b++) {
          let x = 30 + Math.random() * (GAME_WIDTH - 60);
          let y = 0;
          ctx.beginPath();
          ctx.moveTo(x, y);
          while (y < GAME_HEIGHT * 0.7) {
            x += (Math.random() - 0.5) * 40;
            y += 25 + Math.random() * 30;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = Math.min(1, fade * 1.6);
        ctx.fillStyle = 'hsl(0, 100%, 65%)';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚠ DANGER ⚠', GAME_WIDTH / 2, GAME_HEIGHT * 0.35);
        ctx.font = 'bold 18px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(getMonsterName(gameState.level), GAME_WIDTH / 2, GAME_HEIGHT * 0.35 + 30);
        ctx.restore();
      }
    }


    // Draw coins
    coins.forEach(coin => {
      ctx.fillStyle = 'hsl(45, 100%, 55%)';
      ctx.shadowColor = 'hsl(45, 100%, 55%)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'hsl(35, 100%, 40%)';
      ctx.font = 'bold 10px Rajdhani';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', coin.x, coin.y);
      ctx.shadowBlur = 0;
    });

    // Draw lasers
    lasers.forEach(laser => {
      ctx.fillStyle = 'hsl(0, 100%, 60%)';
      ctx.shadowColor = 'hsl(0, 100%, 50%)';
      ctx.shadowBlur = 10;
      ctx.fillRect(laser.x - 2, laser.y, 4, 15);
      ctx.shadowBlur = 0;
    });

    // Draw power-ups with icons
    powerUps.forEach(powerUp => {
      drawPowerUp(ctx, powerUp, gameTime);
    });

    // Draw paddle with premium 3D rendering
    drawPremiumPaddle(
      ctx,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height + 8,
      paddle.hasLaser,
      paddle.hasMagnet,
      paddle.hasShield,
      isGhostPaddle
    );

    // Draw aiming line when ball is stationary on paddle - FIXED to paddle center
    if (magnetBallRef.current) {
      const ball = balls.find(b => b.id === magnetBallRef.current?.id);
      if (ball) {
        // Arrow starts from paddle center, not ball position
        const startX = paddle.x + paddle.width / 2;
        const startY = paddle.y;
        const lineLength = 200;
        const angle = aimAngleRef.current;
        
        ctx.save();
        
        const dotSpacing = 15;
        const numDots = Math.floor(lineLength / dotSpacing);
        
        for (let i = 0; i < numDots; i++) {
          const t = (i + 1) / numDots;
          const animOffset = ((gameTime * 3) % 1) * dotSpacing;
          const dotX = startX + Math.cos(angle) * (i * dotSpacing + animOffset);
          const dotY = startY + Math.sin(angle) * (i * dotSpacing + animOffset);
          
          const alpha = 0.9 - t * 0.6;
          const dotSize = 4 - t * 2;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Arrow tip
        const tipX = startX + Math.cos(angle) * lineLength;
        const tipY = startY + Math.sin(angle) * lineLength;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.moveTo(tipX + Math.cos(angle) * 10, tipY + Math.sin(angle) * 10);
        ctx.lineTo(tipX + Math.cos(angle + 2.5) * 10, tipY + Math.sin(angle + 2.5) * 10);
        ctx.lineTo(tipX + Math.cos(angle - 2.5) * 10, tipY + Math.sin(angle - 2.5) * 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
      }
    }

    // Draw balls with premium 3D rendering
    balls.forEach(ball => {
      // Ball trail removed - clean normal ball

      drawPremiumBall(ctx, ball.position.x, ball.position.y, ball.radius, isFireball, isBigBall);
      
      // Draw electric crackle effect when shock is active
      if (isShock) {
        ctx.save();
        ctx.strokeStyle = `hsla(200, 100%, 70%, ${0.5 + Math.sin(gameTime * 15) * 0.3})`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const angle = (gameTime * 5 + i * Math.PI / 2) % (Math.PI * 2);
          const len = ball.radius + 8 + Math.sin(gameTime * 10 + i) * 4;
          ctx.beginPath();
          ctx.moveTo(ball.position.x, ball.position.y);
          const midX = ball.position.x + Math.cos(angle) * len * 0.5 + (Math.random() - 0.5) * 6;
          const midY = ball.position.y + Math.sin(angle) * len * 0.5 + (Math.random() - 0.5) * 6;
          ctx.lineTo(midX, midY);
          ctx.lineTo(ball.position.x + Math.cos(angle) * len, ball.position.y + Math.sin(angle) * len);
          ctx.stroke();
        }
        ctx.restore();
      }
    });

    // Draw particles
    particles.forEach(particle => {
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw combo indicator
    if (combo > 1) {
      ctx.fillStyle = 'hsl(50, 100%, 55%)';
      ctx.shadowColor = 'hsl(50, 100%, 55%)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 20px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(`${combo}x COMBO!`, GAME_WIDTH / 2, 35);
      ctx.shadowBlur = 0;
    }
    
    // Auto-paddle countdown moved to HUD

    ctx.restore();
    // Fully reset transform to prevent any drift between frames
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

  }, [paddle, balls, bricks, powerUps, particles, lasers, coins, explosions, levelCoins, plane, alienShips, alienBullets, isFireball, isBigBall, isShock, isAutoPaddle, autoPaddleEndTime, isGhostPaddle, screenShake, gameTime, combo, isMonster, monsterHp, monsterFires, gameState.level]);

  // Set up HiDPI canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
        // Preserve the same logical game size while preventing excessive
// backing-buffer pixels on high-density, lower-performance phones.
const dpr = Math.min(window.devicePixelRatio || 1, 2);


    canvas.width = GAME_WIDTH * dpr;
    canvas.height = GAME_HEIGHT * dpr;
    canvas.style.width = `${GAME_WIDTH}px`;
    canvas.style.height = `${GAME_HEIGHT}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full touch-none overflow-hidden flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
        style={{ 
          aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
        }}
      />
    </div>
  );
};

export default GameCanvas;
