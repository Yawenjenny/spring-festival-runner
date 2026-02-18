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
  const load = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (e) => {
        console.error("Failed to load image:", src, e);
        reject(e);
      };
    });
  };

  try {
    const [horse, cloud, mountain, yuanbao] = await Promise.all([
      load(ASSETS.HORSE),
      load(ASSETS.CLOUD),
      load(ASSETS.MOUNTAIN),
      load(ASSETS.YUANBAO),
    ]);
    return { horse, cloud, mountain, yuanbao };
  } catch (error) {
    console.error("Error loading game assets", error);
    throw error;
  }
};
