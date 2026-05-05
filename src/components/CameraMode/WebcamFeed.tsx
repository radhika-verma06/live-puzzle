import React, { useRef, useEffect, useState } from 'react';
import { RefreshCw, Focus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrackingEngine } from '../../hooks/useTrackingEngine';
import { FrameOverlay } from './FrameOverlay';
import { useGameStore } from '../../store/gameStore';

export const WebcamFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLoaded, frame, status, progress, shouldSnap, resetSnap } = useTrackingEngine(videoRef);
  const { setCapturedImage, setMode, setCropRect, resetGame } = useGameStore();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Fallback for camera ready state
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) {
      setIsCameraReady(true);
    }
  }, []);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 1280, height: 720 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    }
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (shouldSnap && videoRef.current && frame) {
      handleSnap();
      resetSnap();
    }
  }, [shouldSnap]);

  const handleSnap = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !frame || video.readyState < 2) return;

    // Flash Effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    const vW = video.videoWidth;
    const vH = video.videoHeight;
    if (vW === 0 || vH === 0) return;
    
    const cropX = frame.x * vW;
    const cropY = frame.y * vH;
    const cropW = frame.width * vW;
    const cropH = frame.height * vH;

    canvas.width = cropW;
    canvas.height = cropH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sourceX = vW - cropX - cropW;

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-cropW, 0);
    ctx.drawImage(video, sourceX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    
    // Direct to Puzzle transition
    resetGame();
    setCapturedImage(dataUrl);
    setCropRect(frame);
    
    // Small delay to let the user see the flash/capture state before switching
    setTimeout(() => {
      setMode('PUZZLE');
    }, 400);
  };

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
      style={{ background: 'black' }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={() => setIsCameraReady(true)}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0"
      />

      <canvas ref={canvasRef} className="hidden" />

      {/* Flash Effect Layer */}
      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white"
          />
        )}
      </AnimatePresence>

      {!isLoaded && (
        <div className="absolute z-[60] flex flex-col items-center gap-4 text-white">
          <RefreshCw className="w-16 h-16 animate-spin text-blue-500" />
          <p className="text-2xl font-black tracking-tighter uppercase italic">Vision Engine Loading...</p>
        </div>
      )}

      {isLoaded && isCameraReady && (
        <>
          <FrameOverlay frame={frame} status={status} progress={progress} />
          
      {/* Top Info HUD */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/20 text-white shadow-2xl">
        <Focus className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-black uppercase tracking-widest text-white">Vision Active</span>
      </div>

          {/* Bottom HUD */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 w-full max-w-md px-6 text-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black/60 backdrop-blur-2xl px-10 py-6 rounded-3xl border border-white/20 shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient pulses when locking */}
              {status === 'LOCKING' && (
                <motion.div 
                  className="absolute inset-0 bg-blue-600/10"
                  animate={{ opacity: [0.1, 0.4, 0.1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}

              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">
                {status === 'SEARCHING' && 'Frame Your World'}
                {status === 'DETECTING' && 'Steady...'}
                {status === 'LOCKING' && 'Locking On!'}
                {status === 'STABLE' && "Almost There!"}
                {status === 'CAPTURING' && 'Captured!'}
              </h2>
              <p className="text-white/60 text-sm font-medium">Form a square with thumb & index. Hold to snap.</p>
            </motion.div>
            
            <button 
              onClick={handleSnap}
              disabled={status === 'SEARCHING' || status === 'CAPTURING'}
              className="group relative p-8 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale overflow-hidden"
            >
              <Zap className={`w-10 h-10 text-black transition-transform ${status === 'LOCKING' ? 'scale-125 rotate-12' : ''}`} />
              <AnimatePresence>
                {status === 'STABLE' && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 2 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-full border-4 border-black/10 animate-ping"
                  />
                )}
              </AnimatePresence>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
