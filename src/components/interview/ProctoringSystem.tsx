'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { useBrowserMonitoring } from '@/hooks/useBrowserMonitoring';
import toast from 'react-hot-toast';
import { ShieldAlert, ShieldCheck, EyeOff, Users, AlertCircle } from 'lucide-react';

interface ProctoringSystemProps {
  sessionId: string;
  fullScreenMode?: boolean;
  onStatusChange?: (status: 'DETECTING' | 'FACE_VISIBLE' | 'LOOKING_AWAY' | 'NO_FACE' | 'MULTIPLE_FACES' | 'DISABLED') => void;
  enabled?: boolean;
}

// Detection Thresholds - carefully tuned for production
const FPS_THROTTLE_MS = 2000; // ~0.5 FPS (1 frame every 2s) to prevent CPU starvation of the Microphone process
const FRAMES_TO_TRIGGER_ABSENCE = 5; // 10 seconds at 0.5 FPS
const FRAMES_TO_TRIGGER_LOOK_AWAY = 2; // 4 seconds at 0.5 FPS
const FRAMES_TO_TRIGGER_MULTIPLE = 2; // 4 seconds at 0.5 FPS

// Gaze tracking bounds
const GAZE_LEFT_THRESHOLD = 0.65;
const GAZE_RIGHT_THRESHOLD = 0.35;

export function ProctoringSystem({ sessionId, fullScreenMode = false, onStatusChange, enabled = true }: ProctoringSystemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<'DETECTING' | 'FACE_VISIBLE' | 'LOOKING_AWAY' | 'NO_FACE' | 'MULTIPLE_FACES' | 'DISABLED'>(enabled ? 'DETECTING' : 'DISABLED');

  useEffect(() => {
    if (onStatusChange) onStatusChange(currentStatus);
  }, [currentStatus, onStatusChange]);

  // Cooldown refs
  const lastViolationTime = useRef<number>(0);
  
  // Temporal state for stability (avoids flickering)
  const state = useRef({
    absenceFrames: 0,
    lookAwayFrames: 0,
    multipleFacesFrames: 0,
    smoothedGazeRatio: 0.5, // 0.5 is perfectly centered
  });

  useBrowserMonitoring({
    enabled: isActive,
    onViolation: (type) => {
      handleViolation(type, `Browser minimized or tab switched (${type})`, true);
    }
  });

  const captureScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Very high compression to ensure fast network transit
    return canvas.toDataURL('image/jpeg', 0.4);
  };

  const handleViolation = async (type: string, description: string, capture: boolean = true) => {
    const now = Date.now();
    // 8 second cooldown between warnings to avoid overwhelming the user
    if (now - lastViolationTime.current < 8000) return;
    
    lastViolationTime.current = now;
    setWarnings((prev) => prev + 1);
    toast.error(`Warning: ${description}`, { duration: 5000, icon: '⚠️' });

    const screenshot = capture ? captureScreenshot() : null;

    try {
      const res = await fetch(`/api/interviews/${sessionId}/proctoring`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: type, description, screenshot }),
      });
      await res.json();
    } catch (error) {
      console.error('Failed to log violation to server', error);
    }
  };

  useEffect(() => {
    let detector: faceLandmarksDetection.FaceLandmarksDetector;
    let animationId: number;
    let isComponentMounted = true;

    if (!enabled) {
      setCurrentStatus('DISABLED');
      return;
    }

    const setupCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Webcam not supported by this browser.');
        return null;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          return new Promise((resolve) => {
            // Failsafe timeout in case browser drops the loadedmetadata event
            const timeout = setTimeout(() => {
              try { videoRef.current?.play(); } catch (e) {}
              resolve(videoRef.current);
            }, 3000);
            
            videoRef.current!.onloadedmetadata = async () => {
              clearTimeout(timeout);
              try { await videoRef.current!.play(); } catch (e) { console.warn("AutoPlay blocked", e); }
              resolve(videoRef.current);
            };
          });
        }
      } catch (e) {
        console.error('Webcam access denied', e);
        toast.error('Please allow webcam access for AI Proctoring.');
      }
      return null;
    };

    const initProctoring = async () => {
      try {
        // No need for tfjs backends (webgl/cpu) since we are using native mediapipe WASM
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig = {
          runtime: 'mediapipe' as const,
          refineLandmarks: true, 
          maxFaces: 1, 
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        };
        
        detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
        if (!isComponentMounted) return;
        setIsModelLoaded(true);

        const videoReady = await setupCamera();
        if (videoReady && isComponentMounted) {
          setIsActive(true);
          detect(detector);
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe WASM detector:", err);
      }
    };

    let lastInferenceTime = 0;
    
    const detect = async (det: faceLandmarksDetection.FaceLandmarksDetector) => {
      if (!isComponentMounted) return;
      if (!videoRef.current || videoRef.current.readyState < 2) {
        animationId = requestAnimationFrame(() => detect(det));
        return;
      }

      const now = Date.now();
      if (now - lastInferenceTime < FPS_THROTTLE_MS) {
        animationId = requestAnimationFrame(() => detect(det));
        return;
      }
      lastInferenceTime = now;

      try {
        const faces = await det.estimateFaces(videoRef.current, { flipHorizontal: false });

        // Trust any face detected by the model, ignoring bounding box size. 
        // This makes the system far more robust in poor lighting/backlighting.
        const validFaces = faces;

        // 1. NO FACE
        if (validFaces.length === 0) {
          state.current.absenceFrames++;
          state.current.lookAwayFrames = Math.max(0, state.current.lookAwayFrames - 2); // Decay
          setCurrentStatus('NO_FACE');
          
          if (state.current.absenceFrames > FRAMES_TO_TRIGGER_ABSENCE) {
            handleViolation('NO_FACE', 'Face not visible on screen for over 10 seconds. Please check your lighting.');
            state.current.absenceFrames = 0;
          }
        } else {
          // Fast recovery if face appears
          state.current.absenceFrames = Math.max(0, state.current.absenceFrames - 3);
        }

        // 2. MULTIPLE FACES
        if (validFaces.length > 1) {
          state.current.multipleFacesFrames++;
          setCurrentStatus('MULTIPLE_FACES');
          
          if (state.current.multipleFacesFrames > FRAMES_TO_TRIGGER_MULTIPLE) {
            handleViolation('MULTIPLE_FACES', 'Multiple people detected in frame.');
            state.current.multipleFacesFrames = 0;
          }
        } else {
          state.current.multipleFacesFrames = Math.max(0, state.current.multipleFacesFrames - 2);
        }

        // 3. LOOKING AWAY (True Iris Gaze Tracking)
        if (validFaces.length === 1 && state.current.absenceFrames === 0) {
          const kp = validFaces[0].keypoints;
          if (kp && kp.length >= 478) {
            // MediaPipe Iris Landmarks
            // Right Eye Bounds: Inner 362, Outer 263. Right Iris Center: 473
            // Left Eye Bounds: Outer 33, Inner 133. Left Iris Center: 468
            const rightEyeInner = kp[362];
            const rightEyeOuter = kp[263];
            const rightIris = kp[473];

            const leftEyeOuter = kp[33];
            const leftEyeInner = kp[133];
            const leftIris = kp[468];

            if (rightEyeInner && rightEyeOuter && rightIris && leftEyeOuter && leftEyeInner && leftIris) {
              // Calculate relative iris position within the eye bounds
              // Since the video is flipped horizontally, we measure relative position
              const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x);
              const rightIrisPos = Math.abs(rightIris.x - rightEyeInner.x);
              const rightGazeRatio = rightEyeWidth > 0 ? rightIrisPos / rightEyeWidth : 0.5;

              const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x);
              const leftIrisPos = Math.abs(leftIris.x - leftEyeInner.x);
              const leftGazeRatio = leftEyeWidth > 0 ? leftIrisPos / leftEyeWidth : 0.5;

              // Average the gaze ratios of both eyes for stability
              const avgGazeRatio = (rightGazeRatio + leftGazeRatio) / 2;

              // Exponential Moving Average (EMA) to smooth out micro-movements
              state.current.smoothedGazeRatio = (state.current.smoothedGazeRatio * 0.8) + (avgGazeRatio * 0.2);

              // Determine if looking away based on the smoothed ratio
              const isLookingAway = 
                state.current.smoothedGazeRatio > GAZE_LEFT_THRESHOLD || 
                state.current.smoothedGazeRatio < GAZE_RIGHT_THRESHOLD;

              if (isLookingAway) {
                state.current.lookAwayFrames++;
                setCurrentStatus('LOOKING_AWAY');
                
                if (state.current.lookAwayFrames > FRAMES_TO_TRIGGER_LOOK_AWAY) {
                  handleViolation('LOOK_AWAY', 'Candidate is not looking at the screen.', false);
                  state.current.lookAwayFrames = 0; // Reset after violation
                }
              } else {
                // Rapid decay when looking back at screen
                state.current.lookAwayFrames = Math.max(0, state.current.lookAwayFrames - 4);
                if (state.current.lookAwayFrames === 0) {
                  setCurrentStatus('FACE_VISIBLE');
                }
              }
            }
          }
        }
      } catch (e) {
        // Ignore frame processing errors to prevent crash loops
        console.error("Proctoring inference error:", e);
      }

      animationId = requestAnimationFrame(() => detect(det));
    };

    initProctoring();

    return () => {
      isComponentMounted = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } else if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (detector) {
        detector.dispose();
      }
    };
  }, [sessionId]);

  // UI Status Helper
  const getStatusDisplay = () => {
    if (!isModelLoaded) return { color: 'text-slate-400', bg: 'bg-slate-500/20', text: 'Initializing AI...', icon: null };
    switch (currentStatus) {
      case 'FACE_VISIBLE': return { color: 'text-green-400', bg: 'bg-green-500/20', text: 'Focus tracked', icon: <ShieldCheck className="w-3 h-3" /> };
      case 'NO_FACE': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', text: 'Face missing', icon: <EyeOff className="w-3 h-3 animate-pulse" /> };
      case 'LOOKING_AWAY': return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', text: 'Looking away', icon: <AlertCircle className="w-3 h-3 animate-pulse" /> };
      case 'MULTIPLE_FACES': return { color: 'text-red-400', bg: 'bg-red-500/20', text: 'Multiple faces', icon: <Users className="w-3 h-3 animate-bounce" /> };
      case 'DISABLED': return { color: 'text-slate-500', bg: 'bg-slate-500/10', text: 'Tracking Disabled', icon: <EyeOff className="w-3 h-3" /> };
      default: return { color: 'text-slate-400', bg: 'bg-slate-500/20', text: 'Detecting...', icon: null };
    }
  };

  const statusUI = getStatusDisplay();

  return (
    <div className={fullScreenMode ? "relative w-full h-full flex flex-col items-center justify-center" : "fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none"}>
      {/* Hidden canvas for taking screenshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Webcam Preview */}
      <div className={`relative bg-slate-900 rounded-xl overflow-hidden border-2 shadow-2xl pointer-events-auto transition-colors duration-500 ${fullScreenMode ? 'w-full h-full max-h-[500px] border-slate-700/50' : 'w-36 h-28 border-slate-700'}`}
           style={{ borderColor: currentStatus === 'FACE_VISIBLE' && !fullScreenMode ? '#334155' : currentStatus === 'MULTIPLE_FACES' ? '#ef4444' : currentStatus !== 'FACE_VISIBLE' ? '#eab308' : undefined }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
        <div className={`absolute bottom-4 right-4 flex flex-col items-end gap-2 ${fullScreenMode ? 'scale-125 origin-bottom-right' : ''}`}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full backdrop-blur-md ${statusUI.bg} ${statusUI.color}`}>
            {statusUI.icon}
          </div>
          
          {/* Status Badge */}
          <div className="bg-slate-800/90 backdrop-blur border border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg pointer-events-auto transition-all">
            <span className="text-xs font-medium text-slate-300 w-24 text-right">
              {statusUI.text}
            </span>
          </div>

          {/* Warnings Badge */}
          {warnings > 0 && (
            <div className="bg-red-500/90 backdrop-blur border border-red-400 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg pointer-events-auto transition-all">
              <ShieldAlert className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">
                Warnings: {warnings}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
