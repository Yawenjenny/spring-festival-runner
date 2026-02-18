import { Horse, Mountain, Yuanbao, Particle } from '../types';
import { COLORS } from '../constants';

// Draw the Horse
export const drawHorse = (ctx: CanvasRenderingContext2D, horse: Horse, image?: HTMLImageElement) => {
  ctx.save();
  ctx.translate(horse.x, horse.y);

  // Gallop animation (Bounce)
  const bounce = horse.isJumping ? 0 : Math.sin(horse.frameCount * 0.2) * 2;
  ctx.translate(0, bounce);

  if (image) {
    // If we have an image asset, draw it
    // We add a slight rotation based on jump to make it dynamic
    if (horse.isJumping) {
      ctx.translate(horse.w / 2, horse.h / 2);
      ctx.rotate(-0.2); // Tilt up slightly when jumping
      ctx.translate(-horse.w / 2, -horse.h / 2);
    }

    // Draw the image
    ctx.drawImage(image, 0, 0, horse.w, horse.h);
  } else {
    // FALLBACK: Draw shapes if image isn't loaded (Old implementation)
    // Body Color
    ctx.fillStyle = COLORS.darkRed;

    // Simple Composite Horse Shape using Path
    ctx.beginPath();
    ctx.ellipse(20, 20, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.ellipse(32, 10, 8, 6, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Legs ... (Abbreviated fallback)
  }

  ctx.restore();
};

// Draw Mountain (Stone style)
export const drawMountain = (ctx: CanvasRenderingContext2D, m: Mountain, image?: HTMLImageElement) => {
  ctx.save();
  ctx.translate(m.x, m.y);

  if (image) {
    // Draw the mountain image
    ctx.drawImage(image, 0, 0, m.w, m.h);
  } else {
    // Fallback: draw shape
    ctx.fillStyle = COLORS.stone;

    // Main Peak
    ctx.beginPath();
    ctx.moveTo(0, m.h);
    ctx.lineTo(m.w / 2, 0);
    ctx.lineTo(m.w, m.h);
    ctx.closePath();
    ctx.fill();

    // Highlight (Snow or Light)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(m.w / 2, 0);
    ctx.lineTo(m.w / 2 + 5, 15);
    ctx.lineTo(m.w / 2 - 5, 15);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
};

// Draw Yuanbao (Gold Ingot)
export const drawYuanbao = (ctx: CanvasRenderingContext2D, yb: Yuanbao, image?: HTMLImageElement) => {
  ctx.save();
  ctx.translate(yb.x, yb.y);

  // Glow effect
  ctx.shadowColor = COLORS.lightGold;
  ctx.shadowBlur = 10;

  if (image) {
    // Preserve the image's natural aspect ratio
    const imgRatio = image.naturalWidth / image.naturalHeight;
    let drawW = yb.w;
    let drawH = yb.h;
    if (imgRatio > 1) {
      // Image is wider than tall
      drawH = yb.w / imgRatio;
    } else {
      // Image is taller than wide
      drawW = yb.h * imgRatio;
    }
    // Center within the bounding box
    const offsetX = (yb.w - drawW) / 2;
    const offsetY = (yb.h - drawH) / 2;
    ctx.drawImage(image, offsetX, offsetY, drawW, drawH);
  } else {
    ctx.fillStyle = COLORS.gold;

    // Boat shape (bottom)
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(yb.w / 2, yb.h + 5, yb.w, 10);
    ctx.lineTo(yb.w - 5, 5);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();

    // Center bump (top)
    ctx.fillStyle = COLORS.lightGold;
    ctx.beginPath();
    ctx.ellipse(yb.w / 2, 8, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export const drawGround = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundHeight: number,
  frame: number,
  speed: number
) => {
  const y = height - groundHeight;

  // Ground Base
  ctx.fillStyle = '#E9AE57';
  ctx.fillRect(0, y, width, groundHeight);

  // Top border line
  ctx.fillStyle = '#D49A45';
  ctx.fillRect(0, y, width, 4);

  // Moving pattern on ground to show speed
  ctx.fillStyle = '#F0BE6E';
  const patternWidth = 40;
  const offset = (frame * speed) % patternWidth;

  for (let i = -1; i < width / patternWidth + 1; i++) {
    ctx.fillRect(i * patternWidth - offset, y + 10, 20, 4);
  }
};

export const drawClouds = (ctx: CanvasRenderingContext2D, frame: number, width: number, image?: HTMLImageElement) => {
  const cloudSpeed = 0.5;
  const offset1 = (frame * cloudSpeed) % (width + 200);
  const offset2 = ((frame * cloudSpeed * 0.8) + 400) % (width + 200);

  if (image) {
    const cloudW1 = 80;
    const cloudH1 = 50;
    const cloudW2 = 60;
    const cloudH2 = 38;

    ctx.save();
    ctx.globalAlpha = 0.85;
    // Cloud 1
    ctx.drawImage(image, width - offset1, 50, cloudW1, cloudH1);
    // Cloud 2
    ctx.drawImage(image, width - offset2, 140, cloudW2, cloudH2);
    ctx.restore();
  } else {
    // Fallback: draw shape clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    // Cloud 1
    ctx.beginPath();
    ctx.arc(width - offset1, 80, 30, 0, Math.PI * 2);
    ctx.arc(width - offset1 + 40, 80, 40, 0, Math.PI * 2);
    ctx.arc(width - offset1 + 80, 80, 30, 0, Math.PI * 2);
    ctx.fill();

    // Cloud 2
    ctx.beginPath();
    ctx.arc(width - offset2, 150, 20, 0, Math.PI * 2);
    ctx.arc(width - offset2 + 30, 150, 30, 0, Math.PI * 2);
    ctx.arc(width - offset2 + 60, 150, 20, 0, Math.PI * 2);
    ctx.fill();
  }
};

export const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.fillStyle = p.color;
  ctx.font = 'bold 16px sans-serif';
  ctx.globalAlpha = p.life / 30; // Fade out
  ctx.fillText(p.text, 0, 0);
  ctx.restore();
};