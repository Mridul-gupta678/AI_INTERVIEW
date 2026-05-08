'use client';

import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

// ─── Configuration ────────────────────────────────────────────────────────────
const SPEECH_START_THRESHOLD = 15;  // Reduced to detect start of speech faster
const SPEECH_END_THRESHOLD = 11;    // Tighter hysteresis gap to detect end of speech faster
const SILENCE_DURATION_MS = 700;    // DRASTICALLY REDUCED (1500ms -> 700ms) for much faster response times
const MIN_AUDIO_SIZE = 2000;        // Lowered minimum chunk size (bytes) to allow faster processing of short answers
const MONITOR_INTERVAL_MS = 50;     // Slightly faster volume polling (60ms -> 50ms)
const MAX_SPEECH_DURATION_MS = 45000; // Safety: force-stop after 45s of continuous "speech" (catches stuck state)
const CONSECUTIVE_SILENCE_CHECKS = 2; // Reduced from 3 to 2 to trigger silence timer faster

// ─── Conversation Turn States ─────────────────────────────────────────────────
export type ConversationTurn =
  | 'IDLE'              // Waiting, no one is talking
  | 'USER_SPEAKING'     // User is actively speaking
  | 'USER_PROCESSING'   // User finished, audio is being transcribed
  | 'AI_THINKING'       // Transcript sent, waiting for AI response
  | 'AI_SPEAKING';      // AI is speaking via TTS

export function useWhisperVAD(onTranscript: (text: string) => void) {
  // ─── Public State ─────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [conversationTurn, setConversationTurn] = useState<ConversationTurn>('IDLE');

  // ─── Refs ─────────────────────────────────────────────────────────────────
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const passiveRecognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechStartTimeRef = useRef<number>(0); // When speech started (for max duration safety)
  const consecutiveSilenceRef = useRef<number>(0); // Count of consecutive silent polls

  const audioChunksRef = useRef<Blob[]>([]);
  const isSpeakingRef = useRef(false);
  const shouldRestartRef = useRef(false);  // true = mic stream is alive
  const micMutedRef = useRef(false);       // true = stream alive but ignore audio (AI is speaking)
  const ignoreNextChunkRef = useRef(false); // true = drop the next audio chunk (used to flush AI echo)
  const turnRef = useRef<ConversationTurn>('IDLE');
  const processingLockRef = useRef(false);
  const interruptDetectedRef = useRef(false);

  // ─── Turn State Setter (syncs ref + state) ─────────────────────────────────
  const setTurn = useCallback((turn: ConversationTurn) => {
    turnRef.current = turn;
    setConversationTurn(turn);
  }, []);

  // ─── Force end speech state (safety valve) ─────────────────────────────────
  const forceEndSpeech = useCallback(() => {
    if (!isSpeakingRef.current) return;
    console.log('[VAD] Force-ending speech state');
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    consecutiveSilenceRef.current = 0;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Stop recorder to trigger sending the audio chunk
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
  }, []);

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  const cleanupAudio = useCallback(() => {
    if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      shouldRestartRef.current = false;
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    if (analyserRef.current) analyserRef.current.disconnect();
    if (passiveRecognitionRef.current) {
      try { passiveRecognitionRef.current.abort(); } catch (e) {}
    }

    streamRef.current = null;
    mediaRecorderRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    passiveRecognitionRef.current = null;
    processingLockRef.current = false;
    interruptDetectedRef.current = false;
    consecutiveSilenceRef.current = 0;
    speechStartTimeRef.current = 0;
    setIsListening(false);
    setIsSpeaking(false);
    setIsTranscribing(false);
    setTranscript('');
    setTurn('IDLE');
  }, [setTurn]);

  // ─── Process Audio Chunk → Whisper Transcription ──────────────────────────
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (audioBlob.size < MIN_AUDIO_SIZE) {
      console.log('[VAD] Audio chunk too small, skipping:', audioBlob.size, 'bytes');
      return;
    }
    if (processingLockRef.current) {
      console.log('[VAD] Processing lock held, skipping chunk');
      return;
    }

    processingLockRef.current = true;
    setIsTranscribing(true);
    setTurn('USER_PROCESSING');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'speech.webm');

    try {
      // Drop the chunk if the mic was muted (AI started speaking during our processing)
      if (micMutedRef.current || !shouldRestartRef.current) {
        setIsTranscribing(false);
        processingLockRef.current = false;
        setTurn('IDLE');
        return;
      }

      const res = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();

      if (data.transcript && data.transcript.trim().length > 3) {
        const finalText = data.transcript.trim();
        setTranscript(finalText);
        setTurn('AI_THINKING');

        const wasInterrupt = interruptDetectedRef.current;
        interruptDetectedRef.current = false;

        const payload = wasInterrupt ? `[INTERRUPTED] ${finalText}` : finalText;
        onTranscript(payload);
      } else {
        setTurn('IDLE');
      }
    } catch (e) {
      console.error('[VAD] Whisper transcription error:', e);
      setTurn('IDLE');
    } finally {
      setIsTranscribing(false);
      processingLockRef.current = false;
    }
  }, [onTranscript, setTurn]);

  // ─── Start Listening ──────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    try {
      cleanupAudio();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3; // Slightly more smoothing to reduce noise flicker
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (shouldRestartRef.current) {
          // Only process audio if the mic was NOT muted when the user finished speaking
          if (!micMutedRef.current && !ignoreNextChunkRef.current) {
            processAudioChunk(audioBlob);
          }
          ignoreNextChunkRef.current = false;
          
          // Always restart the recorder to keep it warm for next utterance
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            try { mediaRecorderRef.current.start(); } catch (e) {}
          }
        }
      };

      // ─── Passive browser SpeechRecognition for live UI transcript ──────
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          // If the mic is muted (AI is speaking), completely ignore all speech recognition
          if (micMutedRef.current) return;

          let currentInterim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentInterim += event.results[i][0].transcript;
          }
          if (currentInterim) {
            setTranscript(currentInterim);
          }
        };
        recognition.onend = () => {
          if (shouldRestartRef.current && passiveRecognitionRef.current) {
            try { passiveRecognitionRef.current.start(); } catch (e) {}
          }
        };
        try {
          recognition.start();
          passiveRecognitionRef.current = recognition;
        } catch (e) {}
      }

      mediaRecorder.start();
      shouldRestartRef.current = true;
      setIsListening(true);
      setTurn('IDLE');

      // VAD loop also respects the mute flag
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // ─── Volume Monitoring Loop (VAD core) ────────────────────────────
      monitorIntervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        // If mic is muted (AI speaking), reset VAD state and skip processing
        if (micMutedRef.current) {
          if (isSpeakingRef.current) {
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            consecutiveSilenceRef.current = 0;
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
          }
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / bufferLength;

        // ─── SAFETY VALVE: Max speech duration ──────────────────────────
        if (isSpeakingRef.current && speechStartTimeRef.current > 0) {
          const elapsed = Date.now() - speechStartTimeRef.current;
          if (elapsed > MAX_SPEECH_DURATION_MS) {
            console.log('[VAD] Max speech duration reached, force-ending');
            forceEndSpeech();
            return;
          }
        }

        if (averageVolume > SPEECH_START_THRESHOLD) {
          // ─── User is clearly speaking ─────────────────────────────
          consecutiveSilenceRef.current = 0; // Reset silence counter

          if (!isSpeakingRef.current) {
            console.log('[VAD] Speech started (volume:', averageVolume.toFixed(1), ')');
            isSpeakingRef.current = true;
            speechStartTimeRef.current = Date.now();
            setIsSpeaking(true);
            setTurn('USER_SPEAKING');
          }

          // Clear any pending silence timer since user is still speaking
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (averageVolume < SPEECH_END_THRESHOLD) {
          // ─── User is quiet (below end threshold - hysteresis) ─────
          if (isSpeakingRef.current) {
            consecutiveSilenceRef.current++;

            // Only start silence timer after N consecutive silent polls
            // This prevents a single quiet frame from triggering end-of-speech
            if (consecutiveSilenceRef.current >= CONSECUTIVE_SILENCE_CHECKS && !silenceTimerRef.current) {
              console.log('[VAD] Silence detected after', consecutiveSilenceRef.current, 'quiet polls, starting timer');
              silenceTimerRef.current = setTimeout(() => {
                console.log('[VAD] Silence timer fired, ending speech');
                isSpeakingRef.current = false;
                speechStartTimeRef.current = 0;
                consecutiveSilenceRef.current = 0;
                setIsSpeaking(false);

                // Stop recorder to trigger sending the audio chunk
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  try { mediaRecorderRef.current.stop(); } catch (e) {}
                }
              }, SILENCE_DURATION_MS);
            }
          }
        } else {
          // ─── Volume is between the two thresholds (dead zone) ─────
          // Don't change state — this prevents flicker when volume hovers near threshold
        }
      }, MONITOR_INTERVAL_MS);

    } catch (e) {
      console.error(e);
      toast.error('Could not access microphone.');
      setIsListening(false);
    }
  }, [cleanupAudio, processAudioChunk, setTurn, forceEndSpeech]);

  // ─── Stop Listening (full teardown) ─────────────────────────────────────
  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    micMutedRef.current = false;
    cleanupAudio();
  }, [cleanupAudio]);

  // ─── Pause Listening (mute VAD while AI speaks — keeps stream alive) ──────
  const pauseListening = useCallback(() => {
    micMutedRef.current = true;
    setTranscript(''); // Clear the UI transcript so stale text doesn't linger
    // Force-end any ongoing speech detection so we start clean when resumed
    if (isSpeakingRef.current) {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      consecutiveSilenceRef.current = 0;
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    }
    console.log('[VAD] Mic muted (AI speaking)');
  }, []);

  // ─── Resume Listening (unmute VAD — stream was never stopped) ─────────────
  const resumeListening = useCallback(() => {
    // Flush any audio that was recorded into the buffer while the AI was speaking (echo)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      ignoreNextChunkRef.current = true;
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    
    micMutedRef.current = false;
    console.log('[VAD] Mic unmuted (user turn), flushed echo buffer');
  }, []);

  // ─── Notify Interrupt (called by parent when user speaks during AI) ───────
  const notifyInterrupt = useCallback(() => {
    interruptDetectedRef.current = true;
  }, []);

  // ─── Check if user is producing voice activity right now ──────────────────
  const checkVoiceActivity = useCallback((): boolean => {
    if (!analyserRef.current) return false;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    return (sum / bufferLength) > SPEECH_START_THRESHOLD;
  }, []);

  return {
    isListening, isSpeaking, isTranscribing, transcript, conversationTurn,
    startListening, stopListening, pauseListening, resumeListening,
    notifyInterrupt, checkVoiceActivity, setTranscript,
  };
}
