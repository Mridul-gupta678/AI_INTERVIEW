// src/components/interview/VoiceRecorder.tsx
'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export interface VoiceRecorderRef {
  startRecording: () => void;
  stopRecording: () => void;
}

export const VoiceRecorder = forwardRef<VoiceRecorderRef, VoiceRecorderProps>(
  ({ onTranscript, disabled }, ref) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio level analysis
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateLevel = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b) / data.length;
        setAudioLevel(avg / 128);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cancelAnimationFrame(animFrameRef.current!);
        setAudioLevel(0);
        stream.getTracks().forEach(t => t.stop());

        if (chunksRef.current.length === 0) return;

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeBlob(blob);
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
  }));

  const transcribeBlob = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const res = await fetch('/api/voice/transcribe', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Transcription failed');

      const { transcript } = await res.json();
      if (transcript?.trim()) {
        onTranscript(transcript.trim());
      } else {
        toast.error('No speech detected');
      }
    } catch {
      toast.error('Voice transcription failed');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current!);
      stopRecording();
    };
  }, []);

  const waveHeights = [4, 8, 12, 8, 4, 10, 14, 10, 6, 8, 4];

  return (
    <div className="flex items-center">
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="processing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-11 h-11 rounded-xl bg-brand-600/10 border border-brand-500/30 flex items-center justify-center"
          >
            <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
          </motion.div>
        ) : isRecording ? (
          <motion.div
            key="recording"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2"
          >
            {/* Waveform */}
            <div className="flex items-center gap-0.5 h-11 px-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              {waveHeights.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-red-400"
                  animate={{
                    height: isRecording ? `${h * (1 + audioLevel * 2)}px` : '4px',
                  }}
                  transition={{ duration: 0.1, delay: i * 0.02 }}
                />
              ))}
            </div>
            <button
              onClick={stopRecording}
              className="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors relative"
            >
              <span className="recording-pulse absolute inset-0 rounded-xl" />
              <Square className="w-4 h-4 text-white fill-white relative z-10" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={startRecording}
            disabled={disabled}
            title="Click to speak (auto-sends when done)"
            className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] flex items-center justify-center hover:border-brand-500/50 hover:bg-brand-600/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Mic className="w-4 h-4 text-[var(--text-secondary)]" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
