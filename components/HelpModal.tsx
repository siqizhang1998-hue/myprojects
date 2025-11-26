import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-[#1a1a1a] w-full max-w-lg border-4 border-[#ef233c] transform -skew-x-2 shadow-[10px_10px_0px_#ef233c] flex flex-col max-h-[85vh]">
        
        {/* Header - Absolute Positioned to break out of box */}
        <div className="bg-[#ef233c] p-3 transform skew-x-2 -mt-6 -ml-6 border-2 border-black w-3/4 absolute top-0 left-0 z-20 shadow-md">
          <h2 className="text-2xl md:text-3xl font-['Permanent_Marker'] text-white uppercase tracking-widest text-shadow-sm leading-none">
            Mission Briefing
          </h2>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 pt-16 md:pt-20 text-white font-['Anton'] tracking-wider space-y-6 overflow-y-auto">
          
          <div className="flex items-start gap-4">
            <div className="text-[#00f5d4] text-3xl font-['Righteous'] leading-none mt-1">01.</div>
            <div>
              <h3 className="text-xl text-[#ef233c] uppercase mb-1 leading-tight">Infiltrate</h3>
              <p className="text-gray-200 font-sans text-base font-medium leading-snug opacity-90">
                Swap adjacent tiles to create lines of 3 or more matching symbols.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="text-[#00f5d4] text-3xl font-['Righteous'] leading-none mt-1">02.</div>
            <div>
              <h3 className="text-xl text-[#ef233c] uppercase mb-1 leading-tight">Chain Reaction</h3>
              <p className="text-gray-200 font-sans text-base font-medium leading-snug opacity-90">
                Matches clear the board. New tiles drop in. Chain matches together (Combos) to multiply your score!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="text-[#00f5d4] text-3xl font-['Righteous'] leading-none mt-1">03.</div>
            <div>
              <h3 className="text-xl text-[#ef233c] uppercase mb-1 leading-tight">Time Limit</h3>
              <p className="text-gray-200 font-sans text-base font-medium leading-snug opacity-90">
                You have 60 seconds. Panic is your enemy. Rhythm is your weapon.
              </p>
            </div>
          </div>
          
           <div className="flex items-start gap-4">
             <div className="text-[#00f5d4] text-3xl font-['Righteous'] leading-none mt-1">04.</div>
            <div>
              <h3 className="text-xl text-[#ef233c] uppercase mb-1 leading-tight">Power Ups</h3>
              <p className="text-gray-200 font-sans text-base font-medium leading-snug opacity-90">
                Match 4 for a Line Blast. Match 5 for a Rainbow Clear.
              </p>
            </div>
          </div>

        </div>

        {/* Footer / Button */}
        <div className="bg-[#1a1a1a] p-4 flex justify-end border-t border-gray-800 z-10 relative mt-auto">
          <button 
            onClick={onClose}
            className="bg-black text-white px-8 py-2 font-['Righteous'] text-xl uppercase hover:bg-[#ef233c] transition-colors skew-x-2 border border-white/20 active:scale-95"
          >
            Roger That
          </button>
        </div>
      </div>
    </div>
  );
};
