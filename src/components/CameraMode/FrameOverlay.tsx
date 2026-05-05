import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TrackingStatus } from '../../hooks/useTrackingEngine';

interface FrameOverlayProps {
  frame: { x: number; y: number; width: number; height: number } | null;
  status: TrackingStatus;
  progress: number;
}

export const FrameOverlay: React.FC<FrameOverlayProps> = ({ frame, status, progress }) => {
  if (!frame) return null;

  const style = {
    left: `${frame.x * 100}%`,
    top: `${frame.y * 100}%`,
    width: `${frame.width * 100}%`,
    height: `${frame.height * 100}%`,
  };

  const getColors = () => {
    switch (status) {
      case 'STABLE': return { border: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' };
      case 'LOCKING': return { border: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' };
      case 'CAPTURING': return { border: '#ffffff', glow: 'rgba(255, 255, 255, 0.8)' };
      default: return { border: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' };
    }
  };

  const { border, glow } = getColors();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute border-4 rounded-3xl"
        initial={false}
        animate={{
          borderColor: border,
          boxShadow: `0 0 40px ${glow}, inset 0 0 20px ${glow}`,
          scale: status === 'STABLE' ? [1, 1.02, 1] : 1,
        }}
        transition={{ scale: { repeat: Infinity, duration: 0.5 } }}
        style={style}
      >
        {/* State Label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-2 rounded-2xl backdrop-blur-xl border border-white/20 whitespace-nowrap text-white font-black text-xs tracking-[0.2em] uppercase"
          >
            {status === 'SEARCHING' && 'Aligning...'}
            {status === 'DETECTING' && 'Frame Found'}
            {status === 'LOCKING' && 'Locking On...'}
            {status === 'STABLE' && 'Ready!'}
            {status === 'CAPTURING' && 'Snap!'}
          </motion.div>
        </AnimatePresence>

        {/* Progress Fill (Charging Effect) */}
        {progress > 0 && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: progress * 0.3 }}
            style={{ originX: 0.5, originY: 0.5 }}
          />
        )}

        {/* Corner Brackets */}
        {[
          'top-0 left-0 border-t-8 border-l-8 rounded-tl-2xl',
          'top-0 right-0 border-t-8 border-r-8 rounded-tr-2xl',
          'bottom-0 left-0 border-b-8 border-l-8 rounded-bl-2xl',
          'bottom-0 right-0 border-b-8 border-r-8 rounded-br-2xl'
        ].map((cls, i) => (
          <div key={i} className={`absolute w-12 h-12 ${cls}`} style={{ borderColor: border }} />
        ))}

        {/* Scanning Line */}
        {status === 'LOCKING' && (
          <motion.div
            className="absolute left-0 right-0 h-1 bg-blue-400/50 shadow-[0_0_15px_rgba(96,165,250,0.8)]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
};
