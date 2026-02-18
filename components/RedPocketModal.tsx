import React from 'react';
import pocket0 from '../pic files/0-50.png';
import pocket50 from '../pic files/50-150.png';
import pocket150 from '../pic files/150-300.png';
import pocket300 from '../pic files/300+.png';

interface RedPocketModalProps {
  score: number;
  onRestart: () => void;
}

const getPocketImage = (score: number): string => {
  if (score >= 300) return pocket300;
  if (score >= 150) return pocket150;
  if (score >= 50) return pocket50;
  return pocket0;
};

const getScoreMessage = (score: number): string => {
  if (score >= 300) return '🎉 Amazing Fortune!';
  if (score >= 150) return '✨ Great Luck!';
  if (score >= 50) return '🧧 Not Bad!';
  return '💪 Try Again!';
};

const RedPocketModal: React.FC<RedPocketModalProps> = ({ score, onRestart }) => {
  const pocketImage = getPocketImage(score);
  const message = getScoreMessage(score);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#E6E3DB] px-4"
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Everything centered vertically as one block */}
      <img
        src={pocketImage}
        alt="Red Pocket"
        className="max-h-[45vh] sm:max-h-[55vh] max-w-[85vw] object-contain drop-shadow-lg"
      />

      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-base sm:text-lg text-[#8B7D6B] font-medium">{message}</p>
        <p className="text-2xl sm:text-3xl font-bold text-[#5C4033] mt-1">¥{score}</p>
      </div>

      <button
        onClick={onRestart}
        onTouchEnd={(e) => { e.preventDefault(); onRestart(); }}
        className="mt-5 sm:mt-6 px-8 sm:px-10 py-3 sm:py-4 bg-[#E9AE57] hover:bg-[#D49A45] text-white text-lg sm:text-xl font-bold rounded-full shadow-lg transform transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#E9AE57]/40"
      >
        Play Again
      </button>

      <span className="absolute bottom-2 right-3 text-[#8B7D6B]/50" style={{ fontSize: '12px' }}>
        Happy CNY by Yawen
      </span>
    </div>
  );
};

export default RedPocketModal;