import { useEffect, useRef, useState, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TrackingStatus = 'SEARCHING' | 'DETECTING' | 'LOCKING' | 'STABLE' | 'CAPTURING';

const SMOOTHING_FACTOR = 0.35;
const STABILITY_THRESHOLD = 0.0025;
const STABILITY_DURATION = 1200; // Faster capture
const MIN_SQUARE_SIZE = 0.15; // Min size of frame in normalized units
const TRACKING_CONFIDENCE_THRESHOLD = 0.6;

export const useTrackingEngine = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [trackingState, setTrackingState] = useState({
    frame: null as Rect | null,
    status: 'SEARCHING' as TrackingStatus,
    progress: 0,
    shouldSnap: false,
  });

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  
  const prevFrameRef = useRef<Rect | null>(null);
  const historyRef = useRef<Rect[]>([]);
  const stabilityStartRef = useRef<number | null>(null);
  const lastSnapTimeRef = useRef<number>(0);

  useEffect(() => {
    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: TRACKING_CONFIDENCE_THRESHOLD,
          minHandPresenceConfidence: TRACKING_CONFIDENCE_THRESHOLD,
          minTrackingConfidence: TRACKING_CONFIDENCE_THRESHOLD,
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to init HandLandmarker:', err);
      }
    }
    
    init();

    return () => {
      landmarkerRef.current?.close();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !videoRef.current) return;

    const detect = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && landmarkerRef.current) {
        const startTimeMs = performance.now();
        const results = landmarkerRef.current.detectForVideo(video, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          const thumb = landmarks[4];
          const index = landmarks[8];

          if (thumb && index) {
            // Calculate center and distance
            const centerX = (thumb.x + index.x) / 2;
            const centerY = (thumb.y + index.y) / 2;
            const distW = Math.abs(thumb.x - index.x);
            const distH = Math.abs(thumb.y - index.y);
            
            // Force Square: Use the larger dimension as the side length
            const side = Math.max(distW, distH);
            
            // Raw frame centered on the fingers
            const rawX = centerX - side / 2;
            const rawY = centerY - side / 2;

            // Clamp to [0, 1] bounds
            const clampedX = Math.max(0, Math.min(1 - side, rawX));
            const clampedY = Math.max(0, Math.min(1 - side, rawY));
            const clampedSide = Math.min(side, 1 - clampedX, 1 - clampedY);

            const rawFrame: Rect = { 
              x: clampedX, 
              y: clampedY, 
              width: clampedSide, 
              height: clampedSide 
            };

            if (clampedSide < MIN_SQUARE_SIZE) {
              setTrackingState(prev => ({ ...prev, frame: null, status: 'SEARCHING', progress: 0 }));
              stabilityStartRef.current = null;
            } else {
              // Smooth Frame
              let smoothed: Rect;
              if (prevFrameRef.current) {
                smoothed = {
                  x: prevFrameRef.current.x + (rawFrame.x - prevFrameRef.current.x) * SMOOTHING_FACTOR,
                  y: prevFrameRef.current.y + (rawFrame.y - prevFrameRef.current.y) * SMOOTHING_FACTOR,
                  width: prevFrameRef.current.width + (rawFrame.width - prevFrameRef.current.width) * SMOOTHING_FACTOR,
                  height: prevFrameRef.current.height + (rawFrame.height - prevFrameRef.current.height) * SMOOTHING_FACTOR,
                };
              } else {
                smoothed = rawFrame;
              }
              prevFrameRef.current = smoothed;

              // Stability Logic
              historyRef.current.push(smoothed);
              if (historyRef.current.length > 10) historyRef.current.shift();

              let status: TrackingStatus = 'DETECTING';
              let progress = 0;
              let snap = false;

              if (historyRef.current.length === 10) {
                const variance = historyRef.current.reduce((acc, f) => {
                  const dx = f.x - smoothed.x;
                  const dy = f.y - smoothed.y;
                  return acc + (dx * dx + dy * dy);
                }, 0) / 10;

                const isStable = variance < STABILITY_THRESHOLD;
                
                if (isStable) {
                  if (!stabilityStartRef.current) stabilityStartRef.current = Date.now();
                  const elapsed = Date.now() - stabilityStartRef.current;
                  progress = Math.min(elapsed / STABILITY_DURATION, 1);
                  
                  if (progress > 0.1) status = 'LOCKING';
                  if (progress > 0.8) status = 'STABLE';
                  
                  if (progress === 1 && Date.now() - lastSnapTimeRef.current > 2000) {
                    snap = true;
                    status = 'CAPTURING';
                  }
                } else {
                  stabilityStartRef.current = null;
                }
              }

              setTrackingState({
                frame: smoothed,
                status,
                progress,
                shouldSnap: snap,
              });
            }
          }
        } else {
          setTrackingState(prev => (prev.frame ? { ...prev, frame: null, status: 'SEARCHING', progress: 0 } : prev));
          stabilityStartRef.current = null;
        }
      }
      requestRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [isLoaded, videoRef]);

  const resetSnap = useCallback(() => {
    setTrackingState(prev => ({ ...prev, shouldSnap: false }));
    stabilityStartRef.current = null;
    lastSnapTimeRef.current = Date.now();
  }, []);

  return { isLoaded, ...trackingState, resetSnap };
};
