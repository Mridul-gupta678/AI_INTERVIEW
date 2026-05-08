// src/components/interview/ChatMessage.tsx
'use client';

import { motion } from 'framer-motion';
import { Brain, User, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  role: 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM';
  content: string;
  timestamp: Date;
  metadata?: { fillerWordCount?: number };
}

export function ChatMessage({ message }: { message: Message }) {
  const isInterviewer = message.role === 'INTERVIEWER';
  const isSystem = message.role === 'SYSTEM';

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 py-2"
      >
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)] px-3">{message.content}</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isInterviewer ? '' : 'flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isInterviewer ? 'bg-brand-600' : 'bg-[var(--bg-tertiary)] border'
      }`}>
        {isInterviewer
          ? <Brain className="w-4 h-4 text-white" />
          : <User className="w-4 h-4 text-[var(--text-secondary)]" />
        }
      </div>

      <div className={`max-w-[75%] ${isInterviewer ? '' : 'items-end flex flex-col'}`}>
        <div className={`flex items-center gap-2 mb-1 ${isInterviewer ? '' : 'flex-row-reverse'}`}>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {isInterviewer ? 'AI Interviewer' : 'You'}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>

        <div className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
          isInterviewer
            ? 'bg-[var(--bg-secondary)] border rounded-tl-sm text-[var(--text-primary)]'
            : 'bg-brand-600/90 text-white rounded-tr-sm'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Filler word indicator */}
        {!isInterviewer && message.metadata?.fillerWordCount && message.metadata.fillerWordCount > 0 && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-400/80">
            <AlertCircle className="w-3 h-3" />
            {message.metadata.fillerWordCount} filler word{message.metadata.fillerWordCount > 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    </motion.div>
  );
}
