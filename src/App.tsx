
import { WebcamFeed } from './components/CameraMode/WebcamFeed';
import { CustomizationPanel } from './components/CustomizeMode/CustomizationPanel';
import { PuzzleBoard } from './components/PuzzleMode/PuzzleBoard';
import { useGameStore } from './store/gameStore';
import './App.css';

function App() {
  const mode = useGameStore((state) => state.mode);

  return (
    <main 
      className="fixed inset-0 bg-black overflow-hidden font-inter"
      style={{ backgroundColor: 'black', color: 'white' }}
    >
      {/* Mode Switcher */}
      {mode === 'CAMERA' && <WebcamFeed />}
      {mode === 'CUSTOMIZE' && <CustomizationPanel />}
      {(mode === 'PUZZLE' || mode === 'COMPLETION') && <PuzzleBoard />}
      
      {/* Global Overlay for Snap Flash */}
      {/* (Triggered by state changes if needed) */}
    </main>
  );
}

export default App;
