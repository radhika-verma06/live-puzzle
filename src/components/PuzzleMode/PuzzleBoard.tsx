import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trophy, Timer, MousePointer2, Settings2, Camera, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';
import { usePuzzleLogic } from '../../hooks/usePuzzleLogic';
import { CustomizationPanel } from '../CustomizeMode/CustomizationPanel';

export const PuzzleBoard: React.FC = () => {
  const { 
    capturedImage, 
    captureId,
    difficulty, 
    background, 
    filter,
    setMode, 
    moves, incrementMoves, 
    timer, tickTimer, isTimerRunning,
    setPuzzleSolved, puzzleSolved,
    playerName,
    resetGame
  } = useGameStore();

  const { tiles, isSolved, initPuzzle, shuffle, moveTile } = usePuzzleLogic(difficulty.size);
  const [hasShuffled, setHasShuffled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const lastInitId = useRef<string | null>(null);

  // Auto-init and shuffle when a new captureId arrives
  useEffect(() => {
    if (captureId && captureId !== lastInitId.current) {
      initPuzzle();
      lastInitId.current = captureId;
      setHasShuffled(false);
      
      // Short delay for "Ready, Set, Go" feel
      const timer = setTimeout(() => {
        handleShuffle();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [captureId, initPuzzle]);

  useEffect(() => {
    let interval: number | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, tickTimer]);

  useEffect(() => {
    if (isSolved && hasShuffled && !puzzleSolved) {
      setPuzzleSolved(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#fbbf24']
      });
    }
  }, [isSolved, hasShuffled, puzzleSolved, setPuzzleSolved]);

  const handleShuffle = () => {
    shuffle();
    setHasShuffled(true);
    resetGame();
    useGameStore.setState({ isTimerRunning: true });
  };

  const handleTileClick = (index: number) => {
    if (puzzleSolved) return;
    const moved = moveTile(index);
    if (moved) incrementMoves();
  };

  if (!capturedImage) return null;

  const size = difficulty.size;

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center p-4 overflow-hidden font-inter transition-all duration-1000"
      style={{ background: background.value }}
    >
      {background.type === 'animated' && <div className={`absolute inset-0 ${background.value}`} />}

      {/* Game HUD */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-50 mb-12 flex gap-8 items-center bg-black/60 backdrop-blur-2xl px-10 py-5 rounded-[2.5rem] border border-white/20 shadow-2xl"
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 mb-1">Session</span>
          <span className="text-xl font-black text-white italic uppercase tracking-tighter">{playerName}</span>
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 mb-1">Time</span>
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-3xl font-mono font-black text-white leading-none">
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="w-px h-12 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 mb-1">Moves</span>
          <div className="flex items-center gap-2">
            <MousePointer2 className="w-4 h-4 text-purple-400" />
            <span className="text-3xl font-mono font-black text-white leading-none">{moves}</span>
          </div>
        </div>
      </motion.div>

      {/* The Puzzle Board Container */}
      <motion.div 
        layoutId="puzzle-board"
        initial={{ scale: 0.8, opacity: 0, rotateY: 20 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        className="relative aspect-square w-full max-w-[650px] bg-black/40 rounded-[3rem] p-6 shadow-[0_50px_150px_rgba(0,0,0,0.7)] border border-white/20 perspective-1000"
      >
        <div className="relative w-full h-full grid" style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`,
          gap: '8px'
        }}>
          <AnimatePresence>
            {tiles.map((tile) => {
              const col = tile.correctPos % size;
              const row = Math.floor(tile.correctPos / size);
              const bgX = size <= 1 ? 0 : (col / (size - 1)) * 100;
              const bgY = size <= 1 ? 0 : (row / (size - 1)) * 100;
              return (
                <motion.div
                  key={tile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  onClick={() => handleTileClick(tile.currentPos)}
                  className={`relative rounded-2xl overflow-hidden cursor-pointer select-none ring-1 ring-white/10 ${
                    tile.isEmpty
                      ? 'opacity-0 pointer-events-none'
                      : 'hover:ring-4 ring-white/50 z-10 hover:scale-[1.03] shadow-2xl active:scale-95 transition-shadow'
                  }`}
                >
                  {!tile.isEmpty && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${capturedImage})`,
                        backgroundSize: `${size * 100}% ${size * 100}%`,
                        backgroundPosition: `${bgX}% ${bgY}%`,
                        filter: filter.filter,
                      }}
                    />
                  )}
                  {tile.currentPos === tile.correctPos && !tile.isEmpty && hasShuffled && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full shadow-[0_0_15px_rgba(74,222,128,1)] ring-2 ring-white/20" 
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Start Overlay (only if not auto-started) */}
        {!hasShuffled && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-[3rem] z-20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <Play className="w-10 h-10 text-white fill-white translate-x-1" />
              </div>
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Preparing Puzzle...</h3>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Floating Controls */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-12 flex gap-4 z-50"
      >
        <button 
          onClick={() => setShowSettings(true)}
          className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 font-bold"
        >
          <Settings2 className="w-5 h-5 text-blue-400" />
          Puzzle Tuning
        </button>
        <button 
          onClick={handleShuffle}
          className="px-10 py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl transition-all font-black uppercase italic tracking-wider hover:scale-105 active:scale-95"
        >
          <RefreshCw className="w-5 h-5 text-purple-400" />
          Reshuffle
        </button>
        <button 
          onClick={() => setMode('CAMERA')}
          className="p-4 bg-white hover:bg-gray-100 text-black rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
          title="New Capture"
        >
          <Camera className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-[200]">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 h-full w-full pointer-events-none flex items-center justify-center p-8"
            >
              <div className="pointer-events-auto w-full max-w-4xl">
                <CustomizationPanel />
                <button 
                  onClick={() => setShowSettings(false)}
                  className="absolute top-12 right-12 text-white/50 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-8 h-8 rotate-45" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Win Modal */}
      <AnimatePresence>
        {puzzleSolved && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[4rem] p-16 text-center max-w-lg shadow-[0_50px_200px_rgba(0,0,0,0.5)] flex flex-col items-center border-[12px] border-black"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center mb-10 shadow-2xl"
              >
                <Trophy className="w-16 h-16 text-black fill-black" />
              </motion.div>
              <h2 className="text-6xl font-black text-black mb-4 italic uppercase tracking-tighter">ULTIMATE WIN!</h2>
              <p className="text-black/40 text-xl font-bold mb-12 uppercase tracking-widest">
                Cleared in <span className="text-black">{timer}s</span> • <span className="text-black">{moves}</span> moves
              </p>
              
              <div className="grid grid-cols-1 gap-4 w-full">
                <button 
                  onClick={() => { setPuzzleSolved(false); handleShuffle(); }}
                  className="w-full py-6 bg-black text-white rounded-3xl font-black text-2xl uppercase italic tracking-tight hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4"
                >
                  <RefreshCw className="w-6 h-6" />
                  REPLAY
                </button>
                <button 
                  onClick={() => { setMode('CAMERA'); setPuzzleSolved(false); }}
                  className="w-full py-6 bg-gray-100 text-black rounded-3xl font-black text-xl uppercase tracking-tighter hover:bg-gray-200 transition-all flex items-center justify-center gap-4"
                >
                  <Camera className="w-6 h-6" />
                  NEW CAPTURE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
