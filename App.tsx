import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GRID_SIZE, SVG_DEFS, COLORS, DECORATION_SVGS } from './constants';
import { Tile, TileType, GameState, SpecialType, FloatingText, Particle } from './types';
import { generateGrid, findMatches, canSwap, getTileAt, groupMatches, findBestMove } from './utils/gameLogic';
import { TileComponent } from './components/TileComponent';
import { ScoreBoard } from './components/ScoreBoard';
import { HelpModal } from './components/HelpModal';
import { audioService } from './services/audioService';

const App: React.FC = () => {
  const [grid, setGrid] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0); // Track best combo for report
  const [timeLeft, setTimeLeft] = useState(60);
  const [isStarted, setIsStarted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [hintTileIds, setHintTileIds] = useState<string[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 600);
  const lastInteractionTime = useRef<number>(Date.now());

  // Robust Sizing Logic: Derive directly from window to avoid Ref 0-width glitches
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // Initial grid generation to ensure tiles are visible immediately (background)
    setGrid(generateGrid());
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dimensions based on CSS constraints (parent has px-4 => 32px padding total)
  // Max container width is hardcapped at 600px in the JSX
  const containerWidth = Math.min(windowWidth - 32, 600);
  const tileSize = Math.floor(containerWidth / GRID_SIZE);

  // Initialize Game
  const initGame = useCallback(async () => {
    await audioService.init();
    setGrid(generateGrid());
    setScore(0);
    setMoves(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(60);
    setGameState(GameState.IDLE);
    setIsStarted(true);
    setFloatingTexts([]);
    setParticles([]);
    setHintTileIds([]);
    lastInteractionTime.current = Date.now(); // Reset hint timer on start
    
    // Start Music logic
    setIsMusicOn(true);
    audioService.startMusic();
    audioService.playSelect();
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!isStarted || timeLeft <= 0 || showHelp) {
      if (timeLeft <= 0 && isStarted) {
          setGameState(GameState.GAME_OVER);
          audioService.stopMusic();
          setIsMusicOn(false);
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isStarted, timeLeft, showHelp]);

  // Hint Logic
  useEffect(() => {
    if (!isStarted || gameState !== GameState.IDLE) {
      setHintTileIds([]);
      return;
    }

    const interval = setInterval(() => {
      // Show hint after 10 seconds of inactivity (increased from 3s)
      if (Date.now() - lastInteractionTime.current > 10000) {
        const hintPair = findBestMove(grid);
        if (hintPair) {
          setHintTileIds([hintPair[0].id, hintPair[1].id]);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [grid, isStarted, gameState]);

  const updateInteraction = () => {
    lastInteractionTime.current = Date.now();
    setHintTileIds([]);
  };

  // Floating Text Logic
  const addFloatingText = (text: string, x: number, y: number, color: string = '#fff') => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
    }, 800);
  };

  const spawnParticles = (tiles: Tile[]) => {
    const newParticles: Particle[] = [];
    tiles.forEach(t => {
      // Create 5 particles per tile
      const colors = ['#ff0055', '#00f5d4', '#fff', '#f15bb5', '#fee440'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      for(let i=0; i<6; i++) {
         const angle = Math.random() * 360;
         const dist = 50 + Math.random() * 50;
         const tx = Math.cos(angle * Math.PI / 180) * dist;
         const ty = Math.sin(angle * Math.PI / 180) * dist;
         
         newParticles.push({
           id: Math.random(),
           x: t.x * tileSize + tileSize/2,
           y: t.y * tileSize + tileSize/2,
           color: color,
           style: {
             '--tx': `${tx}px`,
             '--ty': `${ty}px`,
             '--r': `${Math.random() * 360}deg`,
           } as React.CSSProperties
         });
      }
    });

    setParticles(prev => [...prev, ...newParticles]);
    // Clean up
    setTimeout(() => {
       setParticles(prev => prev.slice(newParticles.length));
    }, 600);
  };

  const toggleMusic = () => {
      const newState = !isMusicOn;
      setIsMusicOn(newState);
      if (newState) {
          audioService.startMusic();
      } else {
          audioService.stopMusic();
      }
  };

  // Core Loop: Check Matches
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) return;
    
    const checkTimer = setTimeout(() => {
      if (gameState === GameState.IDLE) {
        const matches = findMatches(grid);
        if (matches.length > 0) {
          handleMatches(matches);
        }
      }
    }, 250);

    return () => clearTimeout(checkTimer);
  }, [grid, gameState, isStarted]);


  const handleMatches = (initialMatches: Tile[]) => {
    setGameState(GameState.MATCHING);
    updateInteraction();
    
    let allMatchedTiles = new Set<Tile>(initialMatches);
    let tilesToCheck = [...initialMatches];
    const processedIds = new Set<string>();

    while (tilesToCheck.length > 0) {
      const tile = tilesToCheck.pop()!;
      if (processedIds.has(tile.id)) continue;
      processedIds.add(tile.id);

      // Handle Special Tile Explosions
      if (tile.special === SpecialType.HORIZONTAL) {
        const rowTiles = grid.filter(t => t.y === tile.y);
        rowTiles.forEach(t => {
            if (!allMatchedTiles.has(t)) {
                allMatchedTiles.add(t);
                tilesToCheck.push(t);
            }
        });
      } else if (tile.special === SpecialType.VERTICAL) {
        const colTiles = grid.filter(t => t.x === tile.x);
        colTiles.forEach(t => {
            if (!allMatchedTiles.has(t)) {
                allMatchedTiles.add(t);
                tilesToCheck.push(t);
            }
        });
      } else if (tile.special === SpecialType.RAINBOW) {
        const targetType = grid.find(t => t.id !== tile.id && t.type !== tile.type && !allMatchedTiles.has(t))?.type || TileType.HEART;
        const typeTiles = grid.filter(t => t.type === targetType);
        typeTiles.forEach(t => {
             if (!allMatchedTiles.has(t)) {
                allMatchedTiles.add(t);
                tilesToCheck.push(t);
             }
        });
      }
    }

    const finalMatchedArray = Array.from(allMatchedTiles);
    spawnParticles(finalMatchedArray);

    // Calculate Score & Bonus
    const matchCount = finalMatchedArray.length;
    const basePoints = matchCount * 10;
    const comboMultiplier = 1 + (combo * 0.5);
    const totalPoints = Math.floor(basePoints * comboMultiplier);
    const timeBonus = Math.floor(matchCount * 0.2); 
    
    if (isStarted) {
      setScore(prev => prev + totalPoints);
      setTimeLeft(prev => Math.min(prev + timeBonus, 99));
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      audioService.playMatch(matchCount);

      if (finalMatchedArray.length > 0) {
        const centerX = finalMatchedArray.reduce((sum, t) => sum + t.x, 0) / finalMatchedArray.length;
        const centerY = finalMatchedArray.reduce((sum, t) => sum + t.y, 0) / finalMatchedArray.length;
        addFloatingText(`+${totalPoints}`, centerX, centerY, '#00f5d4');
      }
    }

    // Determine Power-Ups Creation
    const matchGroups = groupMatches(initialMatches);
    const tilesToTransform = new Map<string, SpecialType>();

    matchGroups.forEach(group => {
        if (group.length >= 5) {
            const target = group[Math.floor(group.length / 2)];
            tilesToTransform.set(target.id, SpecialType.RAINBOW);
        } else if (group.length === 4) {
            const xs = group.map(t => t.x);
            const ys = group.map(t => t.y);
            const xRange = Math.max(...xs) - Math.min(...xs);
            const yRange = Math.max(...ys) - Math.min(...ys);
            const target = group[Math.floor(group.length / 2)];
            tilesToTransform.set(target.id, xRange > yRange ? SpecialType.VERTICAL : SpecialType.HORIZONTAL);
        }
    });

    const newGrid = grid.map(t => {
      if (tilesToTransform.has(t.id)) {
          return { 
              ...t, 
              special: tilesToTransform.get(t.id),
              isMatched: false,
              isNew: false 
          };
      }
      return finalMatchedArray.find(m => m.id === t.id) ? { ...t, isMatched: true } : t;
    });
    
    setGrid(newGrid);

    // Remove and Drop
    setTimeout(() => {
      const remaining = newGrid.filter(t => !t.isMatched);
      const finalGrid: Tile[] = [...remaining];
      
      for (let x = 0; x < GRID_SIZE; x++) {
        const colTiles = remaining.filter(t => t.x === x).sort((a, b) => a.y - b.y);
        let currentY = GRID_SIZE - 1;
        
        for (let i = colTiles.length - 1; i >= 0; i--) {
          const tileIndex = finalGrid.findIndex(t => t.id === colTiles[i].id);
          if (tileIndex > -1) {
            finalGrid[tileIndex] = { ...finalGrid[tileIndex], y: currentY, isNew: false };
          }
          currentY--;
        }

        while (currentY >= 0) {
           const type = Object.values(TileType)[Math.floor(Math.random() * 6)] as TileType;
           finalGrid.push({
             id: `new-${Date.now()}-${Math.random()}`,
             type,
             x,
             y: currentY,
             isNew: true
           });
           currentY--;
        }
      }
      
      setGrid(finalGrid);
      setGameState(GameState.IDLE);
    }, 400);
  };

  const handleInteraction = (tile: Tile, swipeDirection?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameState !== GameState.IDLE || !isStarted || showHelp) return;
    
    updateInteraction();

    if (swipeDirection) {
       // Handle Swipe
       let targetX = tile.x;
       let targetY = tile.y;
       
       if (swipeDirection === 'LEFT') targetX--;
       if (swipeDirection === 'RIGHT') targetX++;
       if (swipeDirection === 'UP') targetY--;
       if (swipeDirection === 'DOWN') targetY++;

       if (targetX >= 0 && targetX < GRID_SIZE && targetY >= 0 && targetY < GRID_SIZE) {
          const targetTile = getTileAt(grid, targetX, targetY);
          if (targetTile) {
             performSwap(tile, targetTile);
          }
       }
       return;
    }

    // Handle Click
    audioService.playSelect();

    if (selectedTile?.id === tile.id) {
      setSelectedTile(null);
      return;
    }

    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }

    if (canSwap(selectedTile, tile)) {
      performSwap(selectedTile, tile);
    } else {
      setSelectedTile(tile);
      audioService.playError();
    }
  };

  const performSwap = async (t1: Tile, t2: Tile) => {
    setGameState(GameState.SWAPPING);
    setSelectedTile(null);
    audioService.playSwap();

    const swappedGrid = grid.map(t => {
      if (t.id === t1.id) return { ...t, x: t2.x, y: t2.y };
      if (t.id === t2.id) return { ...t, x: t1.x, y: t1.y };
      return t;
    });

    setGrid(swappedGrid);

    setTimeout(() => {
      const matches = findMatches(swappedGrid);
      
      // Check for Special Tile interactions (Rainbow) that findMatches might miss
      const isSpecialInteraction = 
          t1.special === SpecialType.RAINBOW || 
          t2.special === SpecialType.RAINBOW || 
          (t1.special !== SpecialType.NONE && t2.special !== SpecialType.NONE && t1.special !== undefined && t2.special !== undefined);

      if (matches.length > 0 || isSpecialInteraction) {
        setMoves(prev => prev + 1);
        setCombo(0);
        // If it's a special interaction with no direct 3-match, we pass the involved tiles manually
        // so handleMatches can trigger the explosions
        const tilesToProcess = matches.length > 0 ? matches : [t1, t2];
        handleMatches(tilesToProcess);
      } else {
        audioService.playError();
        setGrid(grid); // Revert
        setGameState(GameState.IDLE);
      }
    }, 300);
  };

  // Rank Calculation
  const getRank = (s: number) => {
      if (s > 5000) return { label: 'S', title: 'PHANTOM KING', color: 'text-[#ffd700]' };
      if (s > 3000) return { label: 'A', title: 'MASTER THIEF', color: 'text-[#ef233c]' };
      if (s > 1500) return { label: 'B', title: 'ROOKIE', color: 'text-[#00f5d4]' };
      return { label: 'C', title: 'AMATEUR', color: 'text-gray-400' };
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans relative overflow-hidden touch-none select-none text-white">
      
      {/* Inject SVG Defs safely */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true" style={{ visibility: 'hidden' }}>{SVG_DEFS}</svg>

      {/* Help Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {/* ================= START SCREEN ================= */}
      {!isStarted && gameState !== GameState.GAME_OVER && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute w-[150%] h-[150%] bg-[#ef233c] -top-[50%] -left-[20%] transform rotate-[15deg] origin-bottom-left border-r-8 border-white"></div>
                <div className="absolute top-10 right-10 text-white/5 w-64 h-64">{DECORATION_SVGS.splat}</div>
                <div className="absolute bottom-20 left-10 text-black/10 w-96 h-96">{DECORATION_SVGS.splat}</div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center">
                
                {/* Logo Section */}
                <div className="relative mb-12 transform -rotate-3 hover:scale-105 transition-transform duration-500 cursor-default">
                    <div className="absolute -inset-4 bg-black/50 blur-xl rounded-full"></div>
                    <h1 className="flex flex-col items-center leading-none drop-shadow-[5px_5px_0px_rgba(0,0,0,0.8)]">
                        <span className="text-7xl md:text-8xl font-['Permanent_Marker'] text-white stroke-black tracking-tighter" style={{ WebkitTextStroke: '2px black' }}>
                            PHANTOM
                        </span>
                        <span className="text-6xl md:text-7xl font-['Anton'] text-[#00f5d4] bg-black px-4 transform skew-x-12 border-4 border-white -mt-4">
                            MATCH
                        </span>
                    </h1>
                </div>

                {/* Menu Buttons */}
                <div className="flex flex-col gap-6 w-full max-w-[280px]">
                    <button 
                        onClick={initGame}
                        className="group relative h-16 w-full bg-white text-black font-black text-2xl uppercase tracking-widest transform -skew-x-12 hover:bg-[#ef233c] hover:text-white transition-all duration-200 border-4 border-black shadow-[8px_8px_0px_#000] hover:shadow-[12px_12px_0px_#00f5d4] hover:-translate-y-1 hover:-translate-x-1"
                    >
                        <span className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-20"></span>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                             Start Heist <span className="text-xl group-hover:animate-bounce">►</span>
                        </span>
                    </button>
                    
                    <button 
                        onClick={() => setShowHelp(true)}
                        className="group relative h-12 w-full bg-black text-[#00f5d4] font-['Anton'] text-xl uppercase tracking-widest transform -skew-x-12 border-2 border-[#00f5d4] hover:bg-[#00f5d4] hover:text-black transition-all duration-200"
                    >
                        <span className="relative z-10">Briefing</span>
                    </button>
                </div>
                
                <div className="mt-12 text-white/40 font-['Anton'] text-xs tracking-[0.3em] uppercase">
                    Designed for Phantom Thieves
                </div>
            </div>
        </div>
      )}

      {/* ================= GAME OVER SCREEN ================= */}
      {gameState === GameState.GAME_OVER && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-pop">
           <div className="relative w-full max-w-lg">
              
              {/* Background Shapes */}
              <div className="absolute -top-20 -right-20 text-[#ef233c] w-64 h-64 animate-spin-slow opacity-80">{DECORATION_SVGS.splat}</div>
              <div className="absolute -bottom-10 -left-10 text-[#00f5d4] w-48 h-48 opacity-60">{DECORATION_SVGS.splat}</div>

              {/* Card Container */}
              <div className="relative bg-[#111] border-4 border-white transform rotate-2 shadow-[20px_20px_0px_rgba(0,0,0,0.8)] overflow-hidden">
                  
                  {/* Decorative Header Bar */}
                  <div className="bg-white p-1 overflow-hidden">
                      <div className="flex gap-1">
                          {Array(20).fill(0).map((_, i) => (
                              <div key={i} className="h-2 w-2 bg-black rounded-full"></div>
                          ))}
                      </div>
                  </div>

                  <div className="p-8 relative">
                      {/* Watermark */}
                      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                         <h1 className="text-9xl font-['Anton'] -rotate-12">CONFIDENTIAL</h1>
                      </div>

                      <h2 className="text-5xl font-['Permanent_Marker'] text-white mb-6 text-center transform -rotate-2 drop-shadow-[3px_3px_0px_#ef233c]">
                          MISSION REPORT
                      </h2>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-[#222] p-4 border-l-4 border-[#00f5d4]">
                              <p className="text-xs text-[#00f5d4] font-['Anton'] uppercase tracking-widest">Score</p>
                              <p className="text-4xl text-white font-['Bangers'] tracking-wide">{score}</p>
                          </div>
                          <div className="bg-[#222] p-4 border-l-4 border-[#f15bb5]">
                              <p className="text-xs text-[#f15bb5] font-['Anton'] uppercase tracking-widest">Max Combo</p>
                              <p className="text-4xl text-white font-['Bangers'] tracking-wide">{maxCombo}x</p>
                          </div>
                      </div>

                      {/* Rank Stamp */}
                      <div className="flex justify-between items-end border-t-2 border-dashed border-gray-600 pt-4">
                          <div>
                              <p className="text-gray-400 font-['Anton'] text-sm uppercase">Evaluation</p>
                              <p className={`text-xl ${getRank(score).color} font-bold`}>{getRank(score).title}</p>
                          </div>
                          <div className="relative group">
                              <div className={`text-8xl font-['Permanent_Marker'] ${getRank(score).color} transform -rotate-12 border-4 border-current px-4 rounded-lg opacity-0 animate-[popIn_0.5s_0.5s_forwards]`}>
                                  {getRank(score).label}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-white p-4 flex gap-4 justify-center">
                     <button 
                        onClick={initGame}
                        className="flex-1 bg-black text-white font-['Anton'] text-xl py-3 uppercase hover:bg-[#ef233c] transition-colors border-2 border-transparent hover:border-black"
                     >
                        New Mission
                     </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* ================= GAMEPLAY AREA ================= */}
      <div className={`w-full max-w-2xl px-4 flex flex-col items-center relative z-10 transition-all duration-500 ${gameState === GameState.GAME_OVER ? 'blur-sm grayscale opacity-50' : ''}`}>
        
        {/* Top Controls */}
        <div className="absolute top-0 w-full flex justify-between px-2 z-50 pointer-events-auto">
             <button 
              onClick={toggleMusic}
              className={`group flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all shadow-md ${isMusicOn ? 'bg-[#00f5d4]/90 border-black text-black' : 'bg-black/80 border-gray-600 text-gray-500'}`}
             >
               {isMusicOn ? (
                  <><div className="w-2 h-2 bg-black rounded-full animate-pulse"></div> <span className="text-xs font-black font-['Anton'] tracking-wide">ON AIR</span></>
               ) : (
                  <span className="text-xs font-bold">MUTED</span>
               )}
             </button>

             <button 
               onClick={() => setShowHelp(true)}
               className="text-white bg-black hover:text-[#ef233c] hover:bg-white font-black text-xl w-8 h-8 flex items-center justify-center border-2 border-white rounded-full transition-colors shadow-lg"
             >
               ?
             </button>
        </div>

        <ScoreBoard score={score} moves={moves} timeLeft={timeLeft} />
        
        {/* Game Grid Container - TV Screen Effect */}
        <div className="relative p-2 bg-[#111] rounded-xl border-4 border-[#333] shadow-[0_20px_50px_rgba(0,0,0,0.8)] mt-2">
             <div 
              className={`relative bg-black overflow-hidden w-full max-w-[600px] mx-auto rounded-lg ${combo > 2 ? 'animate-shake' : ''}`}
              style={{ 
                height: containerWidth, 
                width: containerWidth,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,1)'
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                   style={{ 
                     backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
                     backgroundSize: `${tileSize}px ${tileSize}px`,
                   }} 
              />
              
              {/* Halftone Overlay for Style */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

              {grid.map(tile => (
                <TileComponent
                  key={tile.id}
                  tile={tile}
                  isSelected={selectedTile?.id === tile.id}
                  isHint={hintTileIds.includes(tile.id)}
                  onClick={(t) => handleInteraction(t)}
                  onSwipe={(t, dir) => handleInteraction(t, dir)}
                  style={{
                    width: tileSize,
                    height: tileSize,
                    left: tile.x * tileSize,
                    top: tile.y * tileSize
                  }}
                />
              ))}

              {/* Floating Text Overlay */}
              {floatingTexts.map(ft => (
                 <div 
                    key={ft.id}
                    className="absolute pointer-events-none font-['Bangers'] text-4xl z-50 animate-float-out stroke-black stroke-2"
                    style={{
                        left: ft.x * tileSize + tileSize/2,
                        top: ft.y * tileSize,
                        color: ft.color,
                        WebkitTextStroke: '1px black',
                        textShadow: '3px 3px 0px rgba(0,0,0,0.5)'
                    }}
                 >
                    {ft.text}
                 </div>
              ))}
              
              {/* Particles Layer */}
              {particles.map(p => (
                <div 
                  key={p.id}
                  className="absolute w-3 h-3 rounded-full animate-particle pointer-events-none z-40"
                  style={{
                    left: p.x,
                    top: p.y,
                    backgroundColor: p.color,
                    boxShadow: `0 0 5px ${p.color}`,
                    ...p.style
                  }}
                />
              ))}

            </div>

            {/* Decoration Lines around board */}
            <div className="absolute -top-3 -left-3 w-12 h-12 border-t-8 border-l-8 border-[#ef233c] pointer-events-none"></div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-8 border-r-8 border-[#00f5d4] pointer-events-none"></div>
        </div>
        
        {/* Combo Feedback */}
        <div className="h-16 mt-4 flex items-center justify-center w-full">
           {combo > 1 && (
               <div className="text-[#f15bb5] font-['Permanent_Marker'] text-4xl animate-bounce drop-shadow-[4px_4px_0px_#000] transform -rotate-3 border-4 border-black bg-white px-4 py-1">
                   {combo}x COMBO!
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default App;