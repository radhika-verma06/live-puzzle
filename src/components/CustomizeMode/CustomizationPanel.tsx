import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Palette, Layers, Sliders, Wand2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { BACKGROUND_PRESETS, DIFFICULTY_PRESETS, FILTER_PRESETS } from '../../constants/themes';

export const CustomizationPanel: React.FC = () => {
  const { 
    capturedImage, 
    setMode, 
    background, setBackground, 
    difficulty, setDifficulty,
    filter, setFilter,
    resetGame, playerName, setPlayerName 
  } = useGameStore();

  if (!capturedImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-6xl aspect-video grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left: Preview */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative group h-full flex flex-col justify-center"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] border border-white/20">
            <img 
              src={capturedImage} 
              alt="Snap" 
              className="w-full object-cover transition-all"
              style={{ filter: filter.filter }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            
            <div className="absolute top-6 left-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm tracking-widest uppercase">
              Captured Frame
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-6">
            <button 
              onClick={() => setMode('CAMERA')}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center gap-3 transition-colors border border-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Snap
            </button>
            <button 
              onClick={() => { resetGame(); setMode('PUZZLE'); }}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center gap-3 font-bold text-lg shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-6 h-6 fill-white" />
              Start Puzzle
            </button>
          </div>
        </motion.div>

        {/* Right: Customization Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-8 text-white p-4"
        >
          <div>
            <h1 className="text-5xl font-black mb-2 tracking-tight">LIVE PUZZLE</h1>
            <p className="text-white/60 text-lg">Customize your puzzle experience.</p>
          </div>

          <div className="space-y-10">
            {/* Player Name */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50">
                <Wand2 className="w-4 h-4" /> Puzzle Name
              </label>
              <input 
                type="text" 
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all font-medium"
                placeholder="Enter puzzle title..."
              />
            </div>

            {/* Background Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50">
                <Palette className="w-4 h-4" /> Board Environment
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {BACKGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setBackground(preset)}
                    className={`h-12 rounded-xl transition-all hover:scale-110 border-2 ${background.id === preset.id ? 'border-white ring-4 ring-white/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ background: preset.type === 'color' ? preset.value : preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50">
                <Layers className="w-4 h-4" /> Difficulty Level
              </label>
              <div className="flex gap-3">
                {DIFFICULTY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setDifficulty(preset)}
                    className={`flex-1 px-6 py-4 rounded-2xl transition-all border-2 font-bold ${difficulty.id === preset.id ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                  >
                    {preset.label}
                    <div className="text-[10px] uppercase opacity-50">{preset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Enhancements */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/50">
                <Sliders className="w-4 h-4" /> Visual Enhancements
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setFilter(preset)}
                    className={`px-4 py-3 rounded-2xl transition-all border-2 flex items-center justify-between font-medium ${filter.id === preset.id ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
