export type ThemePreset = 'glass' | 'neon' | 'minimal' | 'playful';

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'animated';
  value: string;
}

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Solids
  { id: 'black', name: 'Black', type: 'color', value: '#000000' },
  { id: 'white', name: 'White', type: 'color', value: '#ffffff' },
  { id: 'navy', name: 'Deep Navy', type: 'color', value: '#0a192f' },
  { id: 'forest', name: 'Forest Green', type: 'color', value: '#1a2e1a' },
  { id: 'plum', name: 'Plum', type: 'color', value: '#2d1a2d' },
  { id: 'beige', name: 'Warm Beige', type: 'color', value: '#f5f5dc' },
  // Gradients
  { id: 'purple-blue', name: 'Sky Violet', type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'orange-pink', name: 'Sunset Pink', type: 'gradient', value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
  { id: 'teal-cyan', name: 'Ocean Mist', type: 'gradient', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'black-emerald', name: 'Deep Emerald', type: 'gradient', value: 'linear-gradient(135deg, #000000 0%, #047857 100%)' },
  { id: 'sunset-coral', name: 'Sunset Coral', type: 'gradient', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'midnight-violet', name: 'Midnight', type: 'gradient', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  // Animated (logic handles these CSS classes)
  { id: 'aura', name: 'Aura Bloom', type: 'animated', value: 'aura-animation' },
  { id: 'neon-waves', name: 'Neon Waves', type: 'animated', value: 'neon-animation' },
];

export const DIFFICULTY_PRESETS = [
  { id: 'easy', name: 'Easy', size: 3, label: '3x3' },
  { id: 'medium', name: 'Medium', size: 4, label: '4x4' },
  { id: 'hard', name: 'Hard', size: 5, label: '5x5' },
];

export const FILTER_PRESETS = [
  { id: 'none', name: 'Natural', filter: 'none' },
  { id: 'vivid', name: 'Vivid', filter: 'brightness(1.1) saturate(1.4)' },
  { id: 'monochrome', name: 'Monochrome', filter: 'grayscale(1)' },
  { id: 'dreamy', name: 'Dreamy', filter: 'blur(0.5px) brightness(1.2) sepia(0.2)' },
];
