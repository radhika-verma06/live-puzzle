import { create } from 'zustand';
import type { ThemePreset, BackgroundPreset } from '../constants/themes';
import { DIFFICULTY_PRESETS, BACKGROUND_PRESETS, FILTER_PRESETS } from '../constants/themes';

export type GameMode = 'CAMERA' | 'CUSTOMIZE' | 'PUZZLE' | 'COMPLETION';

interface GameState {
  mode: GameMode;
  capturedImage: string | null;
  cropRect: { x: number; y: number; width: number; height: number } | null;
  
  // Customization settings
  theme: ThemePreset;
  background: BackgroundPreset;
  difficulty: typeof DIFFICULTY_PRESETS[0];
  filter: typeof FILTER_PRESETS[0];
  
  // Game state
  moves: number;
  timer: number;
  isTimerRunning: boolean;
  puzzleSolved: boolean;
  playerName: string;
  captureId: string | null;

  // Actions
  setMode: (mode: GameMode) => void;
  setCapturedImage: (image: string | null, id?: string) => void;
  setCropRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
  setTheme: (theme: ThemePreset) => void;
  setBackground: (bg: BackgroundPreset) => void;
  setDifficulty: (diff: typeof DIFFICULTY_PRESETS[0]) => void;
  setFilter: (filter: typeof FILTER_PRESETS[0]) => void;
  resetGame: () => void;
  incrementMoves: () => void;
  tickTimer: () => void;
  setPuzzleSolved: (solved: boolean) => void;
  setPlayerName: (name: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  mode: 'CAMERA',
  capturedImage: null,
  cropRect: null,
  
  theme: 'glass',
  background: BACKGROUND_PRESETS.find(bg => bg.id === 'purple-blue') || BACKGROUND_PRESETS[0],
  difficulty: DIFFICULTY_PRESETS[0],
  filter: FILTER_PRESETS[0],
  
  moves: 0,
  timer: 0,
  isTimerRunning: false,
  puzzleSolved: false,
  playerName: 'Explorer',
  captureId: null,

  setMode: (mode) => set({ mode }),
  setCapturedImage: (capturedImage, id) => set({ 
    capturedImage, 
    captureId: id || (capturedImage ? Date.now().toString() : null) 
  }),
  setCropRect: (cropRect) => set({ cropRect }),
  setTheme: (theme) => set({ theme }),
  setBackground: (background) => set({ background }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setFilter: (filter) => set({ filter }),
  
  resetGame: () => set({ moves: 0, timer: 0, isTimerRunning: false, puzzleSolved: false }),
  incrementMoves: () => set((state) => ({ moves: state.moves + 1 })),
  tickTimer: () => set((state) => ({ timer: state.timer + 1 })),
  setPuzzleSolved: (puzzleSolved) => set({ puzzleSolved, isTimerRunning: !puzzleSolved }),
  setPlayerName: (playerName) => set({ playerName }),
}));
