'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';

interface SnapshotViewerProps {
  screenshotUrl: string | null;
  eventName: string;
  timestamp: Date;
}

export function SnapshotViewer({ screenshotUrl, eventName, timestamp }: SnapshotViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!screenshotUrl) {
    return <span className="text-[var(--text-muted)] text-xs italic">No snapshot</span>;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg text-xs font-medium transition-colors"
      >
        <Camera className="w-3.5 h-3.5" />
        View Snapshot
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h3 className="text-white font-medium">Violation Snapshot: {eventName}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">{new Date(timestamp).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 flex items-center justify-center bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={screenshotUrl} 
                  alt={`Snapshot for ${eventName}`} 
                  className="max-w-full max-h-[70vh] object-contain rounded-lg border border-slate-800"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
