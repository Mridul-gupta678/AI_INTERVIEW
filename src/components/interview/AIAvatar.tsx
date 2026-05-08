'use client';

import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface AIAvatarProps {
  isSpeaking: boolean;
  isThinking: boolean;
}

export function AIAvatar({ isSpeaking, isThinking }: AIAvatarProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--bg-primary)]">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Pulsing rings when speaking */}
        {isSpeaking && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-brand-500/20"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-brand-500/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            />
          </>
        )}

        {/* Orbiting dots when thinking */}
        {isThinking && !isSpeaking && (
          <motion.div 
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-brand-400 rounded-full shadow-[0_0_15px_rgba(var(--brand-400),0.5)]" />
          </motion.div>
        )}

        {/* Core Avatar */}
        <motion.div 
          className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-2xl shadow-brand-500/20 border-4 border-[var(--bg-secondary)]"
          animate={{
            scale: isSpeaking ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Brain className="w-16 h-16 text-white" />
        </motion.div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">AI Interviewer</h2>
        <p className="text-sm text-[var(--text-muted)] h-6 mt-1 transition-opacity duration-300">
          {isSpeaking ? 'Speaking...' : isThinking ? 'Analyzing...' : 'Listening...'}
        </p>
      </div>
    </div>
  );
}
