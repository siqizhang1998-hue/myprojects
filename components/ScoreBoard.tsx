import React from 'react';

interface ScoreBoardProps {
  score: number;
  moves: number;
  timeLeft: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, moves, timeLeft }) => {
  return (
    <div className="w-full max-w-xl mx-auto mb-4 relative z-10 px-1">
      <div className="flex justify-between items-end relative h-20">
        
        {/* Score - Jagged Box */}
        <div className="relative group w-[35%] max-w-[140px]">
          <div className="absolute inset-0 bg-red-600 transform -skew-x-12 translate-x-1 translate-y-1 border-2 border-black" />
          <div className="relative bg-black border-2 border-white px-2 py-2 transform -skew-x-12 w-full flex flex-col items-center">
             <p className="text-[10px] md:text-xs text-red-500 font-['Anton'] uppercase tracking-widest absolute -top-3 left-0 bg-black px-1 border border-red-500">Score</p>
             <p className="text-2xl md:text-4xl text-white font-['Bangers'] tracking-wide text-shadow-red leading-none mt-1">{score}</p>
          </div>
        </div>

        {/* Timer - Circular Dial */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20">
           <div className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full border-4 flex items-center justify-center bg-black transition-colors duration-500 ${timeLeft < 10 ? 'border-red-500 animate-pulse' : 'border-[#00f5d4]'}`}>
             <div className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow-reverse" style={{ borderStyle: 'dashed' }}></div>
             <span className={`text-2xl md:text-3xl font-['Righteous'] ${timeLeft < 10 ? 'text-red-500' : 'text-[#00f5d4]'}`}>
               {timeLeft}
             </span>
             <span className="absolute -bottom-3 text-[8px] md:text-[10px] font-bold bg-black px-2 text-gray-400">SEC</span>
           </div>
        </div>

        {/* Moves - Jagged Box Inverse */}
        <div className="relative group w-[30%] max-w-[120px]">
          <div className="absolute inset-0 bg-[#00f5d4] transform skew-x-12 translate-x-1 translate-y-1 border-2 border-black" />
          <div className="relative bg-black border-2 border-white px-2 py-2 transform skew-x-12 w-full flex flex-col items-center">
             <p className="text-[10px] md:text-xs text-[#00f5d4] font-['Anton'] uppercase tracking-widest absolute -top-3 right-0 bg-black px-1 border border-[#00f5d4]">Moves</p>
             <p className="text-2xl md:text-3xl text-white font-['Bangers'] tracking-wide leading-none mt-1">{moves}</p>
          </div>
        </div>

      </div>
    </div>
  );
};