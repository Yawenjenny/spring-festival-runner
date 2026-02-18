import horsePng from './pic files/Horse.png';
import cloudPng from './pic files/image 26.png';
import mountainPng from './pic files/Mountain.png';
import yuanbaoPng from './pic files/yuanbao.png';

export const ASSETS = {
  HORSE: horsePng,
  CLOUD: cloudPng,
  MOUNTAIN: mountainPng,
  YUANBAO: yuanbaoPng,
};

export type GameImages = {
  horse: HTMLImageElement;
  cloud: HTMLImageElement;
  mountain: HTMLImageElement;
  yuanbao: HTMLImageElement;
};

export const loadGameAssets = async (): Promise<GameImages> => {
  const loadAndResize = (src: string, maxW: number, maxH: number): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        // Resize logic
        const canvas = document.createElement('canvas');
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Calculate new dimensions maintaining aspect ratio
        const ratio = Math.min(maxW / width, maxH / height);

        // Only resize if the image is larger than target
        if (ratio < 1) {
          width *= ratio;
          height *= ratio;

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Use better quality for downscaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImg = new Image();
            resizedImg.src = canvas.toDataURL('image/png');
            resizedImg.onload = () => resolve(resizedImg);
            resizedImg.onerror = () => resolve(img); // Fallback to original
            return;
          }
        }

        // If no resize needed or context failed
        resolve(img);
      };
      img.onerror = (e) => {
        console.error("Failed to load image:", src, e);
        reject(e);
      };
    });
  };

  try {
    // Resize targets based on max display size * 2 (for retina)
    const [horse, cloud, mountain, yuanbao] = await Promise.all([
      loadAndResize(ASSETS.HORSE, 120, 120),    // Display ~40x40
      loadAndResize(ASSETS.CLOUD, 200, 120),    // Display ~80x50
      loadAndResize(ASSETS.MOUNTAIN, 200, 200), // Display var up to ~100
      loadAndResize(ASSETS.YUANBAO, 64, 64),    // Display ~32x32
    ]);
    return { horse, cloud, mountain, yuanbao };
  } catch (error) {
    console.error("Error loading game assets", error);
    throw error;
  }
};
