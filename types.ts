export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Horse extends Rect {
  vy: number; // Vertical velocity
  isJumping: boolean;
  frameCount: number; // For animation
}

export interface Mountain extends Rect {
  id: number;
}

export interface Yuanbao extends Rect {
  id: number;
  collected: boolean;
  floatOffset: number; // For floating animation
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  life: number;
  text: string;
  color: string;
}

export interface GameConfig {
  gravity: number;
  jumpStrength: number;
  groundHeight: number;
  baseSpeed: number;
  spawnRateMountain: number;
  spawnRateYuanbao: number;
}