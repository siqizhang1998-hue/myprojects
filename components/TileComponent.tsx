import React, { useRef } from 'react';
import { Tile, SpecialType } from '../types';
import { ICONS } from '../constants';

interface TileProps {
  tile: Tile;
  isSelected: boolean;
  isHint: boolean;
  onClick: (tile: Tile) => void;
  onSwipe: (tile: Tile, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  style: React.CSSProperties;
}

export const TileComponent: React.FC<TileProps> = ({ tile, isSelected, isHint, onClick, onSwipe, style }) => {
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // Dynamic class construction based on state
  let animationClass = '';
  if (tile.isMatched) {
    animationClass = 'animate-ping opacity-0';
  } else if (tile.isNew) {
    animationClass = 'animate-pop';
  } else if (isSelected) {
    animationClass = 'animate-shake z-10';
  } else if (isHint) {
    animationClass = 'animate-wiggle z-10 brightness-150';
  }

  // Special Visuals
  const isHorizontal = tile.special === SpecialType.HORIZONTAL;
  const isVertical = tile.special === SpecialType.VERTICAL;
  const isRainbow = tile.special === SpecialType.RAINBOW;

  const handlePointerDown = (e: React.PointerEvent) => {
    // We don't want to prevent default too aggressively to allow clicking, 
    // but for game feel we might want to capture.
    startX.current = e.clientX;
    startY.current = e.clientY;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    const endX = e.clientX;
    const endY = e.clientY;
    const dx = endX - startX.current;
    const dy = endY - startY.current;
    const threshold = 30; // pixels to count as swipe

    if (Math.abs(dx) > Math.abs(dy)) {
       // Horizontal
       if (Math.abs(dx) > threshold) {
         onSwipe(tile, dx > 0 ? 'RIGHT' : 'LEFT');
         return;
       }
    } else {
       // Vertical
       if (Math.abs(dy) > threshold) {
         onSwipe(tile, dy > 0 ? 'DOWN' : 'UP');
         return;
       }
    }

    // If movement was small, treat as click
    onClick(tile);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{
        ...style,
        position: 'absolute',
        transition: 'left 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
        zIndex: isRainbow ? 20 : isSelected ? 15 : 1
      }}
      className="flex items-center justify-center p-1 cursor-pointer touch-none"
    >
      <div className={`
        relative w-full h-full 
        flex items-center justify-center 
        rounded-xl
        transition-all duration-200
        ${isSelected ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' : 'hover:scale-105'}
        ${animationClass}
      `}>
         {/* Background Glow for Selected */}
         {isSelected && <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm animate-pulse" />}
         
         {/* Hint Indicator */}
         {isHint && <div className="absolute inset-0 border-2 border-[#00f5d4] rounded-xl animate-pulse shadow-[0_0_10px_#00f5d4]" />}

         {/* Inner Icon Container - Sticker Look */}
         <div className={`
            w-full h-full p-1.5
            relative z-10 
            filter
            ${isSelected ? 'brightness-125' : ''}
         `}>
            {ICONS[tile.type]}
         </div>
        
        {/* Special Overlays */}
        {isHorizontal && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
             <div className="w-full h-1.5 bg-white/90 shadow-[0_0_5px_#fff] rounded-full"></div>
             <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 text-white font-black text-xs drop-shadow-md">◀</div>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 text-white font-black text-xs drop-shadow-md">▶</div>
          </div>
        )}

        {isVertical && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
             <div className="h-full w-1.5 bg-white/90 shadow-[0_0_5px_#fff] rounded-full"></div>
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-white font-black text-xs drop-shadow-md">▲</div>
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-white font-black text-xs drop-shadow-md">▼</div>
          </div>
        )}
        
        {isRainbow && (
           <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-[-4px] rounded-full border-2 border-white/50 border-dashed animate-spin-slow opacity-80" />
           </div>
        )}
      </div>
    </div>
  );
};