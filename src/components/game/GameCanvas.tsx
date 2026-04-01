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
import { drawPowerUp } from '@/utils/powerUpRenderer';
import { audioManager } from '@/utils/audioManager';
import spaceBackground from '@/assets/space-background.jpg';

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
  
  // Track shield expiry time
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
    const [showShop, setShowShop] = useState(false);
  const paddleTargetRef = useRef(paddle.x);
  const magnetBallRef = useRef<Ball | null>(null);
  const laserAutoFireRef = useRef<NodeJS.Timeout | null>(null);
  const aimAngleRef = useRef<number>(-Math.PI / 2);
  const lastAutoTimerRef = useRef(0);

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
      const levelIndex = Math.min(gameState.level - 1, levels.length - 1);
      const level = levels[levelIndex];
      
      const newBricks: Brick[] = level.bricks.map((brick) => ({
        ...brick,
        id: generateId(),
        destroyed: false,
        originalX: brick.x,
      }));
      
      setBricks(newBricks);
      
      const baseBallSpeed = level.ballSpeed;
      setBallSpeed(baseBallSpeed);
      
      // Reset ALL state on new level - including laser
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
      setPaddle(prev => ({ 
        ...prev, 
        width: PADDLE_WIDTH,
        hasLaser: false,
        hasMagnet: false,
        hasShield: false,
      }));
      
      // Clear laser auto-fire interval explicitly
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

  // Reset on game over
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

  // Track previous brick count for level completion check
  const prevBrickCountRef = useRef<number>(0);
  
  // Check for level completion
  useEffect(() => {
    if (gameState.status !== 'playing') return;
    
    const remainingBricks = bricks.filter(b => !b.destroyed && b.type !== 'indestructible');
    const hadBricks = prevBrickCountRef.current > 0;
    
    if (remainingBricks.length === 0 && hadBricks) {
      // Immediately stop laser and mark level as completing
      levelCompletingRef.current = true;
      setPaddle(prev => ({ ...prev, hasLaser: false }));
      setLasers([]);
      if (laserAutoFireRef.current) {
        clearInterval(laserAutoFireRef.current);
        laserAutoFireRef.current = null;
      }
      setTimeout(() => onLevelComplete(), 300);
    }
    
    prevBrickCountRef.current = remainingBricks.length;
  }, [bricks, gameState.status, onLevelComplete]);

  // Create particles
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
    
    // During aiming (ball on paddle), rotate aim arrow
    if (magnetBallRef.current) {
      const ball = balls.find(b => b.id === magnetBallRef.current?.id);
      if (ball) {
        const dx = x - ball.position.x;
        const dy = y - ball.position.y;
        let angle = Math.atan2(dy, dx);
        if (angle > 0) angle = -0.01;
        if (angle < -Math.PI) angle = -Math.PI + 0.01;
        aimAngleRef.current = angle;
      }
      // Only allow paddle movement during magnet powerup, NOT initial aiming
      if (paddle.hasMagnet) {
        paddleTargetRef.current = Math.max(0, Math.min(GAME_WIDTH - paddle.width, x - paddle.width / 2));
      }
      return;
    }
    
    // Auto-paddle: user touching = instant override
    if (isAutoPaddle) {
      userOverrideRef.current = true;
    }
    
    paddleTargetRef.current = Math.max(0, Math.min(GAME_WIDTH - paddle.width, x - paddle.width / 2));
  }, [paddle.width, balls, isAutoPaddle]);

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
      if (magnetBallRef.current) {
        const ballId = magnetBallRef.current.id;
        const angle = aimAngleRef.current;
        magnetBallRef.current = null;
        audioManager.playMagnetRelease();
        setBalls(prevBalls => prevBalls.map(ball => {
          if (ball.id === ballId) {
            const speed = ballSpeed;
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
      if (isAutoPaddle) {
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
  }, [gameState.status, handlePointerMove, ballSpeed, isAutoPaddle]);
  
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
     if (levelCompletingRef.current) {
    return;
  }
    // Use fixed sub-steps for smoother physics
    const numSteps = Math.max(1, Math.ceil(deltaTime / 0.008));
    const stepDt = deltaTime / numSteps;
    
    // Check emergency powerup activation
    if (emergencyRef?.current) {
      const type = emergencyRef.current;
      emergencyRef.current = null;
      switch(type) {
        case 'auto':
          setIsAutoPaddle(true);
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
      }
    }

    setGameTime(prev => prev + deltaTime);
    
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

    // Check auto-paddle expiry
    if (isAutoPaddle && autoPaddleEndTime > 0 && gameTime >= autoPaddleEndTime) {
      setIsAutoPaddle(false);
      setAutoPaddleEndTime(0);
    }
    
    // Update auto timer in HUD
    if (isAutoPaddle && autoPaddleEndTime > 0) {
      const remaining = Math.max(0, Math.ceil(autoPaddleEndTime - gameTime));
      if (remaining !== lastAutoTimerRef.current) {
        lastAutoTimerRef.current = remaining;
        setGameState(prev => ({ ...prev, autoTimer: remaining }));
      }
    } else if (lastAutoTimerRef.current !== 0) {
      lastAutoTimerRef.current = 0;
      setGameState(prev => ({ ...prev, autoTimer: 0 }));
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
          // Override smooth movement — force instant jump
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
    setBricks(prev => updateMovingBricks(prev, deltaTime));

    // Update balls with sub-stepping for smoothness
    setBalls(prevBalls => {
      const newBalls = prevBalls.map(ball => {
        if (magnetBallRef.current && ball.id === magnetBallRef.current.id) {
          // Auto-release ball when auto-paddle is active + magnet
          if (isAutoPaddle) {
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
            if (step === 0) audioManager.playWallBounce();
          }
          if (x + ball.radius > GAME_WIDTH) {
            x = GAME_WIDTH - ball.radius;
            dx = -Math.abs(dx);
            if (step === 0) audioManager.playWallBounce();
          }
          if (y - ball.radius < 0) {
            y = ball.radius;
            dy = Math.abs(dy);
            if (step === 0) audioManager.playWallBounce();
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

        return {
          ...ball,
          position: { x, y },
          velocity: { dx, dy },
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
          position: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 },
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
            
            // Vibrate on big ball hit
            if (isBigBall) {
              try { navigator.vibrate?.(250); } catch {}
            }
            
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
              setGameState(prev => ({ ...prev, coins: prev.coins + 1 }));
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
              setTimeout(() => {
                setBalls(prev => prev.map(ball => ({
                  ...ball,
                  radius: BALL_RADIUS,
                })));
                setIsBigBall(false);
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
              setTimeout(() => setIsFireball(false), 10000);
              break;
            case 'laser':
              setPaddle(prev => ({ ...prev, hasLaser: true }));
              setTimeout(() => setPaddle(prev => ({ ...prev, hasLaser: false })), 7000);
              break;
            case 'magnet':
              setPaddle(prev => ({ ...prev, hasMagnet: true }));
              setTimeout(() => setPaddle(prev => ({ ...prev, hasMagnet: false })), 10000);
              break;
            case 'shield':
              if (shieldTimerRef.current) {
                clearTimeout(shieldTimerRef.current);
              }
              setPaddle(prev => ({ ...prev, hasShield: true }));
              shieldTimerRef.current = setTimeout(() => {
                setPaddle(prev => ({ ...prev, hasShield: false }));
              }, 10000);
              break;
            case 'autopaddle':
              // Auto-paddle: starts instantly, lasts 15 seconds
              setIsAutoPaddle(true);
              setAutoPaddleEndTime(gameTime + 15);
              userOverrideRef.current = false;
              break;
            case 'shock':
              setIsShock(true);
              setTimeout(() => setIsShock(false), 10000);
              break;
            case 'ghost':
              setIsGhostPaddle(true);
              setTimeout(() => setIsGhostPaddle(false), 10000);
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
          setGameState(prev => ({ ...prev, coins: prev.coins + 1 }));
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

    // Update particles
    setParticles(prevParticles => {
      return prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.dx * deltaTime,
          y: particle.y + particle.dy * deltaTime,
          dy: particle.dy + 200 * deltaTime,
          life: particle.life - deltaTime * 2,
        }))
        .filter(particle => particle.life > 0);
    });
  }, [paddle, balls, bricks, gameState.score, ballSpeed, isFireball, isBigBall, isShock, isAutoPaddle, autoPaddleEndTime, isGhostPaddle, explosions, createParticles, destroyBrick, onScoreChange, onLevelComplete, onGameOver, setGameState, plane, lastPowerUpTime, gameTime, levelCoins]);

  useGameLoop(gameLoop, gameState.status === 'playing');

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    if (screenShake > 0) {
      const shakeX = Math.max(-5, Math.min(5, (Math.random() - 0.5) * screenShake));
      const shakeY = Math.max(-5, Math.min(5, (Math.random() - 0.5) * screenShake));
      ctx.translate(shakeX, shakeY);
    }

    // Galaxy space background with spiral nebula, clouds, and stars
    // Base dark space gradient
    if (bgImageRef.current) {
  ctx.drawImage(bgImageRef.current, 0, 0, GAME_WIDTH, GAME_HEIGHT);
} else {
  ctx.fillStyle = 'hsl(270, 10%, 2%)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

    // Distant stars layer (tiny dots)
    for (let i = 0; i < 80; i++) {
      const starX = ((i * 137 + 17) % GAME_WIDTH);
      const starY = ((i * 89 + 31) % GAME_HEIGHT);
      const baseSize = (i % 3) * 0.3 + 0.2;
      const twinkle = 1; // No twinkling - always full brightness
      const alpha = 0.5; // Fixed alpha value
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(starX, starY, baseSize, 0, Math.PI * 2);
      ctx.fill();
      if (i % 10 === 0 && twinkle > 0.85) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(starX - 2, starY);
        ctx.lineTo(starX + 2, starY);
        ctx.moveTo(starX, starY - 2);
        ctx.lineTo(starX, starY + 2);
        ctx.stroke();
      }
    }

    // Galaxy spiral nebula (center-right of canvas)
    const galaxyTime = gameTime * 0.015;
    const galaxyCX = GAME_WIDTH * 0.55;
    const galaxyCY = GAME_HEIGHT * 0.58;
    const galaxyRadius = GAME_WIDTH * 0.55;

    // Outer glow halo
    const haloGrad = ctx.createRadialGradient(galaxyCX, galaxyCY, 0, galaxyCX, galaxyCY, galaxyRadius * 1.1);
    haloGrad.addColorStop(0, 'hsla(270, 60%, 50%, 0.08)');
    haloGrad.addColorStop(0.3, 'hsla(250, 50%, 40%, 0.05)');
    haloGrad.addColorStop(0.6, 'hsla(220, 40%, 30%, 0.03)');
    haloGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = haloGrad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Spiral arms
    ctx.save();
    ctx.translate(galaxyCX, galaxyCY);
    ctx.rotate(galaxyTime * 0.3);
    const numArms = 2;
    for (let arm = 0; arm < numArms; arm++) {
      const armOffset = (arm / numArms) * Math.PI * 2;
      for (let j = 0; j < 60; j++) {
        const t = j / 60;
        const angle = armOffset + t * Math.PI * 3.5;
        const r = t * galaxyRadius * 0.9;
        const sx = Math.cos(angle) * r;
        const sy = Math.sin(angle) * r * 0.6; // Flatten for perspective
        const dotSize = (1 - t) * 8 + 1;
        const hue = 260 + t * 60 + arm * 30; // Purple to blue shift
        const lightness = 45 + (1 - t) * 20;
        const alpha = (1 - t * 0.8) * 0.15;
        
        const spiralGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, dotSize);
        spiralGrad.addColorStop(0, `hsla(${hue}, 60%, ${lightness}%, ${alpha * 1.5})`);
        spiralGrad.addColorStop(0.5, `hsla(${hue}, 50%, ${lightness - 10}%, ${alpha * 0.7})`);
        spiralGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = spiralGrad;
        ctx.fillRect(sx - dotSize, sy - dotSize, dotSize * 2, dotSize * 2);
      }
    }

    // Galaxy bright core
    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
    coreGrad.addColorStop(0, 'hsla(40, 80%, 85%, 0.25)');
    coreGrad.addColorStop(0.3, 'hsla(280, 60%, 60%, 0.15)');
    coreGrad.addColorStop(0.6, 'hsla(260, 50%, 45%, 0.08)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ambient nebula clouds (top-left and bottom-right atmospheric glow)
    const cloudTime = gameTime * 0.03;
    
    // Top-right cloud
    const c1X = GAME_WIDTH * 0.8 + Math.sin(cloudTime * 0.5) * 15;
    const c1Y = GAME_HEIGHT * 0.12 + Math.cos(cloudTime * 0.3) * 10;
    const cGrad1 = ctx.createRadialGradient(c1X, c1Y, 0, c1X, c1Y, 100);
    cGrad1.addColorStop(0, 'hsla(210, 50%, 35%, 0.08)');
    cGrad1.addColorStop(0.5, 'hsla(220, 40%, 25%, 0.04)');
    cGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = cGrad1;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Bottom-left cloud
    const c2X = GAME_WIDTH * 0.15 + Math.sin(cloudTime * 0.4 + 2) * 12;
    const c2Y = GAME_HEIGHT * 0.85 + Math.cos(cloudTime * 0.6 + 1) * 8;
    const cGrad2 = ctx.createRadialGradient(c2X, c2Y, 0, c2X, c2Y, 120);
    cGrad2.addColorStop(0, 'hsla(200, 45%, 30%, 0.07)');
    cGrad2.addColorStop(0.5, 'hsla(210, 35%, 20%, 0.03)');
    cGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = cGrad2;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Dark planet silhouette (bottom-left, like in reference)
    const planetX = GAME_WIDTH * 0.06;
    const planetY = GAME_HEIGHT * 0.52;
    const planetR = 22;
    const planetGrad = ctx.createRadialGradient(planetX + 4, planetY - 4, 0, planetX, planetY, planetR);
    planetGrad.addColorStop(0, 'hsl(220, 20%, 18%)');
    planetGrad.addColorStop(0.6, 'hsl(220, 25%, 10%)');
    planetGrad.addColorStop(1, 'hsl(220, 30%, 5%)');
    ctx.fillStyle = planetGrad;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, 0, Math.PI * 2);
    ctx.fill();
    // Planet edge glow
    ctx.strokeStyle = 'hsla(200, 60%, 50%, 0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(planetX, planetY, planetR, -0.8, 0.8);
    ctx.stroke();

    // Draw shield - solid blue line that bounces ball
    if (paddle.hasShield) {
      ctx.save();
      ctx.shadowColor = 'hsl(200, 100%, 60%)';
      ctx.shadowBlur = 20;
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

    // Draw bricks with premium 3D rendering
    bricks.forEach(brick => {
      if (brick.destroyed) return;
      
      if (brick.type === 'ghost') {
        const visibility = (Math.sin(gameTime * 3) + 1) / 2;
        ctx.globalAlpha = 0.3 + visibility * 0.7;
      }
      
      drawPremiumBrick(ctx, brick, gameTime);
      
      ctx.globalAlpha = 1;
    });

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
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // Draw combo indicator
    if (combo > 1) {
      ctx.fillStyle = 'hsl(50, 100%, 55%)';
      ctx.shadowColor = 'hsl(50, 100%, 55%)';
      ctx.shadowBlur = 15;
      ctx.font = 'bold 20px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText(`${combo}x COMBO!`, GAME_WIDTH / 2, 35);
      ctx.shadowBlur = 0;
    }
    
    // Auto-paddle countdown moved to HUD

    ctx.restore();

  }, [paddle, balls, bricks, powerUps, particles, lasers, coins, explosions, levelCoins, plane, isFireball, isBigBall, isShock, isAutoPaddle, autoPaddleEndTime, isGhostPaddle, screenShake, gameTime, combo]);

  // Set up HiDPI canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
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
      className="relative w-full max-w-[400px] mx-auto touch-none"
    >
{/* Shop Button - Top Right Corner */}
<button
  onClick={() => setShowShop(!showShop)}
  style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '8px 16px',
    backgroundColor: '#FFD700',
    color: '#000',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 100,
  }}
>
  🛒 Shop ({gameState.coins})
</button>

{/* Shop Modal - Popup Window */}
{showShop && (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0,0,0,0.9)',
    border: '2px solid #FFD700',
    borderRadius: '10px',
    padding: '20px',
    zIndex: 200,
    maxWidth: '300px',
  }}>
    <h3 style={{ color: '#FFD700', marginTop: 0 }}>Power-Up Shop</h3>
    
    {/* Laser Power-up Button */}
    <button onClick={() => {
      if (gameState.coins >= 50) {
        setGameState(prev => ({ ...prev, coins: prev.coins - 50 }));
        setPaddle(prev => ({ ...prev, hasLaser: true }));
        setShowShop(false);
      }
    }} style={{
      display: 'block',
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#FF6B6B',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: gameState.coins >= 50 ? 'pointer' : 'not-allowed',
      opacity: gameState.coins >= 50 ? 1 : 0.5,
    }}>
      🔫 Laser - 50 coins
    </button>

    {/* Shield Power-up Button */}
    <button onClick={() => {
      if (gameState.coins >= 40) {
        setGameState(prev => ({ ...prev, coins: prev.coins - 40 }));
        setPaddle(prev => ({ ...prev, hasShield: true }));
        setShowShop(false);
      }
    }} style={{
      display: 'block',
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#4ECDC4',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: gameState.coins >= 40 ? 'pointer' : 'not-allowed',
      opacity: gameState.coins >= 40 ? 1 : 0.5,
    }}>
      🛡️ Shield - 40 coins
    </button>

    {/* Magnet Power-up Button */}
    <button onClick={() => {
      if (gameState.coins >= 35) {
        setGameState(prev => ({ ...prev, coins: prev.coins - 35 }));
        setPaddle(prev => ({ ...prev, hasMagnet: true }));
        setShowShop(false);
      }
    }} style={{
      display: 'block',
      width: '100%',
      padding: '10px',
      marginBottom: '10px',
      backgroundColor: '#95E1D3',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: gameState.coins >= 35 ? 'pointer' : 'not-allowed',
      opacity: gameState.coins >= 35 ? 1 : 0.5,
    }}>
      🧲 Magnet - 35 coins
    </button>

    {/* Close Button */}
    <button onClick={() => setShowShop(false)} style={{
      display: 'block',
      width: '100%',
      padding: '10px',
      backgroundColor: '#666',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }}>
      Close
    </button>
  </div>
)}

// ============================================
// END OF SHOP CODE - PASTE EVERYTHING ABOVE
// ============================================

      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg"
style={{ 
  aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
  display: 'block',
}}
      />
    </div>
  );
};

export default GameCanvas;
