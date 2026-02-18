import React from 'react';
import SpringRunnerGame from './components/SpringRunnerGame';

const App: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-[#E6E3DB] relative overflow-hidden px-0 sm:px-2 py-0 sm:py-4">

      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#5C4033] mb-3 sm:mb-6 drop-shadow-sm tracking-wide z-10 text-center" style={{ marginTop: '-140px' }}>
        Spring Festival Runner
      </h1>

      <div className="z-10 overflow-hidden w-full max-w-[800px]">
        <SpringRunnerGame />
      </div>

      <span className="absolute bottom-2 right-3 text-[#8B7D6B]/50" style={{ fontSize: '12px' }}>
        Happy CNY by Yawen
      </span>
    </div>
  );
};

export default App;