import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Horse, Mountain, Yuanbao, Particle } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CONFIG, COLORS, YUANBAO_VALUE } from '../constants';
import RedPocketModal from './RedPocketModal';
import { drawHorse, drawMountain, drawYuanbao, drawGround, drawClouds, drawParticle } from '../utils/drawUtils';
import { loadGameAssets, GameImages } from '../assets';
import coinCollectedSfx from '../sound effect/coin collected.mp3';
import hitMountainSfx from '../sound effect/hit mountain.mp3';
import yuanbaoIcon from '../pic files/yuanbao.png';

const SpringRunnerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  // Initialize width immediately to avoid layout shift/logic mismatch
  const [gameWidth, setGameWidth] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 380 : 800
  );

  // Set game width based on screen size (Zoom in for mobile)
  useEffect(() => {
    const handleResize = () => {
      // If mobile, use smaller width to "zoom in" (make objects look bigger)
      if (window.innerWidth < 640) {
        setGameWidth(380);
      } else {
        setGameWidth(800);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Store loaded images
  const imagesRef = useRef<GameImages | null>(null);

  // Sound effects
  const coinSoundRef = useRef<HTMLAudioElement | null>(null);
  const hitSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    coinSoundRef.current = new Audio(coinCollectedSfx);
    hitSoundRef.current = new Audio(hitMountainSfx);
  }, []);

  // Constants for Horse Dimensions
  const HORSE_SIZE = 40; // Smaller horse
  const HITBOX_PADDING = 15; // Forgiving hitbox — only the core of the horse counts

  // Mutable game state references for the game loop to avoid closure staleness
  const stateRef = useRef({
    horse: {
      x: 50,
      y: 0,
      w: HORSE_SIZE,
      h: HORSE_SIZE,
      vy: 0,
      isJumping: false,
      frameCount: 0
    } as Horse,
    mountains: [] as Mountain[],
    yuanbaos: [] as Yuanbao[],
    particles: [] as Particle[],
    gameSpeed: CONFIG.baseSpeed,
    score: 0,
    frame: 0,
    isRunning: false,
  });

  // Load Assets on Mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        const loadedImages = await loadGameAssets();
        imagesRef.current = loadedImages;
        setAssetsLoaded(true);
      } catch (e) {
        console.error("Failed to load game assets", e);
      }
    };
    loadAssets();
  }, []);

  // Initialize/Reset Game
  const initGame = useCallback(() => {
    stateRef.current = {
      horse: {
        x: 60,
        y: CANVAS_HEIGHT - CONFIG.groundHeight - HORSE_SIZE + 4, // +4 to sink slightly into ground for weight
        w: HORSE_SIZE,
        h: HORSE_SIZE,
        vy: 0,
        isJumping: false,
        frameCount: 0
      },
      mountains: [],
      yuanbaos: [],
      particles: [],
      gameSpeed: CONFIG.baseSpeed,
      score: 0,
      frame: 0,
      isRunning: true,
    };
    setScore(0);
    setGameState(GameState.PLAYING);
  }, []);

  const handleJump = useCallback(() => {
    const { horse, isRunning } = stateRef.current;

    // Start game if on start screen and assets are ready
    if (!isRunning && gameState === GameState.START) {
      if (assetsLoaded) {
        initGame();
      }
      return;
    }

    // Only jump if on the ground
    // Use a small threshold (5px) to allow jumping even if slightly off due to float rounding
    const groundLevel = CANVAS_HEIGHT - CONFIG.groundHeight - horse.h;
    if (horse.y >= groundLevel - 5) {
      horse.vy = CONFIG.jumpStrength;
      horse.isJumping = true;
    }
  }, [gameState, initGame, assetsLoaded]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        handleJump();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling/zooming
      handleJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleJump]);

  // Main Game Loop
  useEffect(() => {
    // Don't start loop if assets aren't loaded
    if (!assetsLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    let animationFrameId: number;

    const spawnEntities = (frame: number, speed: number) => {
      // Spawn Mountains
      // As speed increases, spawn slightly more frequently but maintain gap
      if (frame % Math.floor(CONFIG.spawnRateMountain / (speed / CONFIG.baseSpeed)) === 0) {
        if (Math.random() > 0.6) { // 40% chance (less frequent, like Dino)
          const mh = 30 + Math.floor(Math.random() * 25); // height between 30 and 55
          const mw = Math.floor(mh * 0.8); // width proportional to height
          const overlap = 4; // Sink slightly into the ground so it doesn't float
          stateRef.current.mountains.push({
            id: frame,
            x: gameWidth,
            y: CANVAS_HEIGHT - CONFIG.groundHeight - mh + overlap,
            w: mw,
            h: mh + overlap,
          });
        }
      }

      // Spawn Yuanbao
      if (frame % Math.floor(CONFIG.spawnRateYuanbao / (speed / CONFIG.baseSpeed)) === 0) {
        if (Math.random() > 0.3) {
          // Random height: low, mid, high
          const heightLevels = [
            CANVAS_HEIGHT - CONFIG.groundHeight - 50, // Ground level (adjusted for bigger horse)
            CANVAS_HEIGHT - CONFIG.groundHeight - 120, // Jump level
            CANVAS_HEIGHT - CONFIG.groundHeight - 180 // High jump level
          ];
          const y = heightLevels[Math.floor(Math.random() * heightLevels.length)];
          const ybX = gameWidth;
          const ybW = 32;
          const ybH = 32;
          const buffer = 20; // Extra spacing to keep them visually apart

          // Check if this yuanbao would overlap with any mountain
          const overlapsWithMountain = stateRef.current.mountains.some(m =>
            ybX < m.x + m.w + buffer &&
            ybX + ybW + buffer > m.x &&
            y < m.y + m.h + buffer &&
            y + ybH + buffer > m.y
          );

          if (!overlapsWithMountain) {
            stateRef.current.yuanbaos.push({
              id: frame,
              x: ybX,
              y: y,
              w: ybW,
              h: ybH,
              collected: false,
              floatOffset: Math.random() * Math.PI * 2
            });
          }
        }
      }
    };

    const checkCollisions = () => {
      const { horse, mountains, yuanbaos } = stateRef.current;

      const horseRect = {
        x: horse.x + HITBOX_PADDING,
        y: horse.y + HITBOX_PADDING,
        w: horse.w - (HITBOX_PADDING * 2),
        h: horse.h - (HITBOX_PADDING * 2),
      };

      // Check Mountains (Game Over)
      for (const m of mountains) {
        const mRect = {
          x: m.x + 10,
          y: m.y + 10,
          w: m.w - 20,
          h: m.h - 10,
        };

        if (
          horseRect.x < mRect.x + mRect.w &&
          horseRect.x + horseRect.w > mRect.x &&
          horseRect.y < mRect.y + mRect.h &&
          horseRect.y + horseRect.h > mRect.y
        ) {
          // Play hit sound
          if (hitSoundRef.current) {
            hitSoundRef.current.currentTime = 0;
            hitSoundRef.current.play().catch(() => { });
          }
          endGame();
          return;
        }
      }

      // Check Yuanbaos (Score)
      for (const yb of yuanbaos) {
        if (yb.collected) continue;

        if (
          horseRect.x < yb.x + yb.w &&
          horseRect.x + horseRect.w > yb.x &&
          horseRect.y < yb.y + yb.h &&
          horseRect.y + horseRect.h > yb.y
        ) {
          yb.collected = true;
          stateRef.current.score += YUANBAO_VALUE;
          setScore(stateRef.current.score); // Sync React state for UI

          // Play coin collected sound
          if (coinSoundRef.current) {
            coinSoundRef.current.currentTime = 0;
            coinSoundRef.current.play().catch(() => { });
          }

          // Add Particle
          stateRef.current.particles.push({
            id: Date.now(),
            x: yb.x,
            y: yb.y,
            life: 30,
            text: `+${YUANBAO_VALUE}¥`,
            color: COLORS.gold
          });
        }
      }
    };

    const endGame = () => {
      stateRef.current.isRunning = false;
      setGameState(GameState.GAME_OVER);
    };

    const render = () => {
      if (!ctx || !canvas) return;

      const { horse, mountains, yuanbaos, particles, gameSpeed, frame, isRunning } = stateRef.current;

      // CLEAR
      ctx.clearRect(0, 0, gameWidth, CANVAS_HEIGHT);

      // BACKGROUND
      // Draw simple background gradient or solid color
      ctx.fillStyle = COLORS.bgSky;
      ctx.fillRect(0, 0, gameWidth, CANVAS_HEIGHT);

      // Draw clouds/decorations
      drawClouds(ctx, frame, gameWidth, imagesRef.current?.cloud);

      // Draw Ground
      drawGround(ctx, gameWidth, CANVAS_HEIGHT, CONFIG.groundHeight, frame, gameSpeed);

      // UPDATE LOGIC
      if (isRunning) {
        // Physics
        horse.vy += CONFIG.gravity;
        horse.y += horse.vy;

        // Ground Collision
        const groundY = CANVAS_HEIGHT - CONFIG.groundHeight - horse.h + 4; // +4 to sink slightly
        if (horse.y > groundY) {
          horse.y = groundY;
          horse.vy = 0;
          horse.isJumping = false;
        }

        // Speed Progression (Very subtle)
        // Increase speed by 0.2 every 1000 frames
        stateRef.current.gameSpeed = CONFIG.baseSpeed + Math.floor(frame / 1000) * 0.2;

        // Entities Movement & Cleanup (mutate in place to avoid GC on mobile)
        for (let i = mountains.length - 1; i >= 0; i--) {
          mountains[i].x -= gameSpeed;
          if (mountains[i].x + mountains[i].w <= -100) mountains.splice(i, 1);
        }

        for (let i = yuanbaos.length - 1; i >= 0; i--) {
          const yb = yuanbaos[i];
          yb.x -= gameSpeed;
          yb.y += Math.sin((frame * 0.03) + yb.floatOffset) * 0.3;
          if (yb.x + yb.w <= -100 || yb.collected) yuanbaos.splice(i, 1);
        }

        for (let i = particles.length - 1; i >= 0; i--) {
          particles[i].y -= 1;
          particles[i].life -= 1;
          if (particles[i].life <= 0) particles.splice(i, 1);
        }

        stateRef.current.frame++;
        horse.frameCount++;

        spawnEntities(frame, gameSpeed);
        checkCollisions();
      }

      // DRAW ENTITIES

      // Yuanbaos
      yuanbaos.forEach(yb => {
        if (!yb.collected) drawYuanbao(ctx, yb, imagesRef.current?.yuanbao);
      });

      // Mountains
      mountains.forEach(m => drawMountain(ctx, m, imagesRef.current?.mountain));

      // Horse
      // Pass the image if loaded
      drawHorse(ctx, horse, imagesRef.current?.horse);

      // Particles
      particles.forEach(p => drawParticle(ctx, p));

      // LOOP
      if (gameState !== GameState.GAME_OVER) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Start Loop
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, assetsLoaded, gameWidth]); // Re-bind when game state changes (mainly for restart)

  return (
    <div className="relative" ref={containerRef} onClick={handleJump} style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={CANVAS_HEIGHT}
        className="block bg-[#E6E3DB] w-full h-auto cursor-pointer"
      />

      {/* HUD - Score */}
      <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center bg-white/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-sm pointer-events-none">
        <img src={yuanbaoIcon} alt="yuanbao" className="h-3 sm:h-4 w-auto object-contain mr-1 sm:mr-1.5" />
        <span className="text-base sm:text-xl font-bold text-red-700 font-mono">¥{score}</span>
        {gameWidth < 600 && <span className="ml-2 text-xs text-gray-500">Mobile v2</span>}
      </div>

      {/* Loading Overlay */}
      {!assetsLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
          <div className="text-red-600 font-bold animate-pulse">Loading Assets...</div>
        </div>
      )}

      {/* Start Overlay */}
      {gameState === GameState.START && assetsLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-[#5C4033] p-4 sm:p-6 rounded-lg shadow-xl text-center animate-bounce-slow">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-2">Ready?</h2>
            <p className="text-white text-sm sm:text-lg">Press Space or Tap to Jump</p>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === GameState.GAME_OVER && (
        <RedPocketModal score={score} onRestart={initGame} />
      )}
    </div>
  );
};

export default SpringRunnerGame;