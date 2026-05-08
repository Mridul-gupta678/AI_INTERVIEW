import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, AlertTriangle, ShieldAlert } from 'lucide-react';

interface FullscreenWarningModalProps {
  isVisible: boolean;
  violations: number;
  maxViolations: number;
  onEnterFullscreen: () => void;
}

export function FullscreenWarningModal({ isVisible, violations, maxViolations, onEnterFullscreen }: FullscreenWarningModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => buttonRef.current?.focus(), 100);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fs-warning-title"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-500" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mb-6">
                {violations === maxViolations - 1 ? (
                  <ShieldAlert className="w-8 h-8 text-brand-500 animate-pulse" />
                ) : (
                  <Monitor className="w-8 h-8 text-brand-400" />
                )}
              </div>
              
              <h2 id="fs-warning-title" className="text-2xl font-bold text-white mb-2">
                {violations === 0 ? "Enter Fullscreen Mode" : "Fullscreen Exited"}
              </h2>
              
              <div className="text-slate-300 space-y-4 mb-8">
                {violations === 0 ? (
                  <p>
                    To ensure a distraction-free and secure interview experience, you must switch to fullscreen mode.
                  </p>
                ) : (
                  <>
                    <p>
                      <strong className="text-amber-400">⚠️ You exited fullscreen. Please return to continue.</strong>
                    </p>
                    
                    {violations === maxViolations - 1 ? (
                      <p className="text-red-400 font-medium bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                        This is your {violations}nd warning. One more violation will instantly terminate your interview session.
                      </p>
                    ) : (
                      <p>
                        This is your {violations}st warning. Continued exits will terminate the interview.
                      </p>
                    )}
                  </>
                )}
              </div>

              <button
                ref={buttonRef}
                onClick={onEnterFullscreen}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl border border-brand-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg shadow-brand-500/20"
              >
                {violations === 0 ? "Enter Fullscreen" : "Re-enter Fullscreen"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
