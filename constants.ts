import { GameConfig } from './types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;

export const CONFIG: GameConfig = {
  gravity: 0.3,         // Low gravity = stays in air longer, jumps further
  jumpStrength: -10,    // Half the previous jump height
  groundHeight: 50,
  baseSpeed: 1,
  spawnRateMountain: 200, // Much wider gaps between obstacles
  spawnRateYuanbao: 100,
};

export const COLORS = {
  primaryRed: '#DC2626', // red-600
  darkRed: '#991B1B', // red-800
  gold: '#F59E0B', // amber-500
  lightGold: '#FCD34D', // amber-300
  stone: '#E7E5E4', // stone-200 (Lighter stone for contrast on dark background)
  bgSky: '#E6E3DB',
};

export const YUANBAO_VALUE = 10;