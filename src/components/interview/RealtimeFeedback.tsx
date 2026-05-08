// src/components/interview/RealtimeFeedback.tsx
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Lightbulb, Star } from 'lucide-react';

interface Feedback {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
}

export function RealtimeFeedback({ feedback }: { feedback: Feedback }) {
  const scoreColor =
    feedback.score >= 75 ? 'text-green-400' :
    feedback.score >= 50 ? 'text-yellow-400' : 'text-red-400';

  const scoreBg =
    feedback.score >= 75 ? 'bg-green-500/10 border-green-500/20' :
    feedback.score >= 50 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      className={`mb-3 rounded-xl border px-4 py-3 ${scoreBg}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Star className={`w-4 h-4 ${scoreColor}`} />
          <span className={`text-sm font-bold ${scoreColor}`}>{feedback.score}/100</span>
        </div>

        {feedback.strengths[0] && (
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <TrendingUp className="w-3 h-3" />
            <span>{feedback.strengths[0]}</span>
          </div>
        )}

        {feedback.weaknesses[0] && (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <TrendingDown className="w-3 h-3" />
            <span>{feedback.weaknesses[0]}</span>
          </div>
        )}

        {feedback.suggestion && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] ml-auto">
            <Lightbulb className="w-3 h-3 text-yellow-400 shrink-0" />
            <span>{feedback.suggestion}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
