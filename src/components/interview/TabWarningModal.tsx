import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface TabWarningModalProps {
  isVisible: boolean;
  violations: number;
  maxViolations: number;
  onDismiss: () => void;
}

export function TabWarningModal({ isVisible, violations, maxViolations, onDismiss }: TabWarningModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible) {
      // Accessibility: trap focus to the modal's dismiss button when it appears
      setTimeout(() => buttonRef.current?.focus(), 100);
      
      // Auto-dismiss after 5 seconds if they don't click
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="warning-title"
          >
            {/* Red Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                {violations === maxViolations - 1 ? (
                  <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                )}
              </div>
              
              <h2 id="warning-title" className="text-2xl font-bold text-white mb-2">
                Tab Switch Detected
              </h2>
              
              <div className="text-slate-300 space-y-4 mb-8">
                <p>
                  <strong className="text-amber-400">⚠️ Tab switching and minimizing the browser are not allowed during the interview.</strong>
                </p>
                
                {violations === maxViolations - 1 ? (
                  <p className="text-red-400 font-medium bg-red-500/10 py-2 px-3 rounded-lg border border-red-500/20">
                    This is your {violations}nd warning. One more violation will instantly terminate your interview session.
                  </p>
                ) : (
                  <p>
                    Please stay focused on this screen. This is violation {violations} of {maxViolations}.
                  </p>
                )}
              </div>

              <button
                ref={buttonRef}
                onClick={onDismiss}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                I Understand, Return to Interview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
