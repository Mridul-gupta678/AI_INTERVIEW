'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Brain, CheckCircle2, AlertTriangle, Code2, X, Mic, MicOff, Shield, MessageSquare, Activity, Video, Maximize2, Settings, Server, Wifi, Eye, Layout, AlertCircle, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProctoringSystem } from '@/components/interview/ProctoringSystem';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { useWhisperVAD, ConversationTurn } from '@/hooks/useWhisperVAD';
import { AIAvatar } from '@/components/interview/AIAvatar';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { TabWarningModal } from '@/components/interview/TabWarningModal';
import { useFullscreenEnforcement } from '@/hooks/useFullscreenEnforcement';
import { FullscreenWarningModal } from '@/components/interview/FullscreenWarningModal';
import { InterviewBootSequence } from '@/components/interview/InterviewBootSequence';

// ─── Configuration ────────────────────────────────────────────────────────────
const CAPTION_LINGER_MS = 3000;        // How long AI caption stays after speech ends
// ─── 3-Stage Silence Escalation Timings ─────────────────────────────────────
const STAGE_1_DELAY_MS = 10000;        // 10 seconds → Stage 1: Gentle prompt
const STAGE_2_DELAY_MS = 10000;        // +10 seconds → Stage 2: Clarification/support
const STAGE_3_DELAY_MS = 10000;        // +10 seconds → Stage 3: Graceful transition
const ADAPTIVE_REDUCTION_MS = 1000;    // Reduce timing by 1s for each consecutive silence
const INTERRUPT_POLL_MS = 200;         // How often to check for user interrupts during AI speech

interface Message {
  id: string;
  role: 'INTERVIEWER' | 'CANDIDATE' | 'SYSTEM';
  content: string;
  timestamp: Date;
}

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();

  // ─── Core State ───────────────────────────────────────────────────────────
  const [hasStarted, setHasStarted] = useState(false);
  const [interviewDone, setInterviewDone] = useState(false);
  const interviewDoneRef = useRef(false);
  const [interviewTerminated, setInterviewTerminated] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const aiSpeakingRef = useRef(false);
  const [aiThinking, setAiThinking] = useState(false);
  const aiThinkingRef = useRef(false);

  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('python');

  const [totalFillerWords, setTotalFillerWords] = useState(0);
  const [aiCaption, setAiCaption] = useState<string>('');
  const aiCaptionRef = useRef<string>('');

  const [advancedSettings, setAdvancedSettings] = useState<any>(null);

  // ─── Fetch Advanced Settings ──────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => {
        if (data.profile?.advancedSettings) {
          setAdvancedSettings(data.profile.advancedSettings);
        }
      })
      .catch(e => console.error("Failed to load settings:", e));
  }, []);

  // ─── Realtime Session Monitoring ──────────────────────────────────────────
  const [faceStatus, setFaceStatus] = useState<'DETECTING' | 'FACE_VISIBLE' | 'LOOKING_AWAY' | 'NO_FACE' | 'MULTIPLE_FACES' | 'DISABLED'>('DETECTING');
  const [netStatus, setNetStatus] = useState('Stable');
  const [camActive, setCamActive] = useState(true);

  useEffect(() => {
    const checkNet = () => setNetStatus(navigator.onLine ? 'Stable' : 'Disconnected');
    window.addEventListener('online', checkNet);
    window.addEventListener('offline', checkNet);
    
    // Check camera permission
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then(res => {
        setCamActive(res.state === 'granted');
        res.onchange = () => setCamActive(res.state === 'granted');
      }).catch(() => setCamActive(true));
    }

    return () => {
      window.removeEventListener('online', checkNet);
      window.removeEventListener('offline', checkNet);
    };
  }, []);

  // ─── Turn-Based Control Refs ──────────────────────────────────────────────
  const vadMethodsRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const interruptCheckRef = useRef<NodeJS.Timeout | null>(null);
  const silenceStage1Ref = useRef<NodeJS.Timeout | null>(null);
  const silenceStage2Ref = useRef<NodeJS.Timeout | null>(null);
  const silenceStage3Ref = useRef<NodeJS.Timeout | null>(null);
  const silenceStageRef = useRef(0);                // Current silence stage (0 = none, 1-3)
  const consecutiveSilenceCountRef = useRef(0);     // How many times user was silent in a row
  const pendingResponseRef = useRef(false);         // Waiting for user response?
  const hasSpokenThisTurnRef = useRef(false);       // Has the user started speaking yet?

  // ─── Elapsed Timer ────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/interviews/${sessionId}/messages`); // Warm up
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  // ─── Cancel All Silence Timers ────────────────────────────────────────────
  const clearSilenceTimers = useCallback(() => {
    if (silenceStage1Ref.current) {
      clearTimeout(silenceStage1Ref.current);
      silenceStage1Ref.current = null;
    }
    if (silenceStage2Ref.current) {
      clearTimeout(silenceStage2Ref.current);
      silenceStage2Ref.current = null;
    }
    if (silenceStage3Ref.current) {
      clearTimeout(silenceStage3Ref.current);
      silenceStage3Ref.current = null;
    }
    silenceStageRef.current = 0;
  }, []);

  // ─── TTS Playback with Turn-Based Control ─────────────────────────────────
  const playTTS = useCallback(async (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any in-progress speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    (window as any).activeUtterance = utterance; // Prevent Chrome GC bug

    // Set speaking state IMMEDIATELY (before onstart fires) to prevent race conditions
    setAiSpeaking(true);
    aiSpeakingRef.current = true;

    // Select best available voice based on advancedSettings
    const targetVoiceType = advancedSettings?.aiVoice || 'onyx';
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice;
    
    if (targetVoiceType === 'onyx' || targetVoiceType === 'alloy') {
      preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft Mark') || v.name.includes('Daniel'));
    } else {
      preferredVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Zira'));
    }
    
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US')) || voices[0];
    }
    
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = advancedSettings?.speakingSpeed || 1.0;
    utterance.pitch = 0.9;

    // WATCHDOG: Chrome's speechSynthesis silently stalls after ~5 minutes of use —
    // onend never fires, leaving aiSpeakingRef stuck at true and the mic permanently off.
    // If onend hasn't fired within estimated duration + 5s buffer, force-recover everything.
    const estimatedDurationMs = Math.min(text.length * 75 + 5000, 30000);
    const watchdog = setTimeout(() => {
      if (aiSpeakingRef.current) {
        console.warn('[TTS] Watchdog triggered — speechSynthesis stalled. Force-recovering mic.');
        window.speechSynthesis.cancel();
        setAiSpeaking(false);
        aiSpeakingRef.current = false;
        aiCaptionRef.current = '';
        setAiCaption('');
        vadMethodsRef.current?.start();
        pendingResponseRef.current = true;
        silenceStageRef.current = 0;
      }
    }, estimatedDurationMs);

    utterance.onstart = () => {
      setAiCaption(text);
      aiCaptionRef.current = text;
      // TURN CONTROL: Pause mic while AI speaks to prevent feedback loop
      vadMethodsRef.current?.stop();
    };

    utterance.onend = () => {
      clearTimeout(watchdog);
      setAiSpeaking(false);
      aiSpeakingRef.current = false;
      aiCaptionRef.current = '';
      setTimeout(() => setAiCaption(''), CAPTION_LINGER_MS);

      if (interviewDoneRef.current) {
        return; // Do NOT restart mic if interview is finished
      }

      // TURN CONTROL: AI finished speaking → hand mic back to user
      vadMethodsRef.current?.start();
      pendingResponseRef.current = true;
      hasSpokenThisTurnRef.current = false; // Reset: it's a fresh turn for the user
      silenceStageRef.current = 0;
    };

    utterance.onerror = () => {
      clearTimeout(watchdog);
      setAiSpeaking(false);
      aiSpeakingRef.current = false;
      aiCaptionRef.current = '';
      vadMethodsRef.current?.start();
      pendingResponseRef.current = true;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // ─── Interrupt Handler: Cancel AI Speech if User Starts Talking ───────────
  const handleUserInterrupt = useCallback(() => {
    if (!aiSpeakingRef.current) return;

    console.log('[Turn Control] User interrupted AI speech. Cancelling TTS.');
    window.speechSynthesis.cancel();
    setAiSpeaking(false);
    aiSpeakingRef.current = false;
    setAiCaption('');
    aiCaptionRef.current = '';
  }, []);

  // ─── Send Voice Message with Response Classification ──────────────────────
  const sendVoiceMessage = useCallback(async (content: string) => {
    if (!content.trim() || interviewDoneRef.current) return;
    
    // STRICT TURN CONTROL: Do NOT send if AI is currently thinking or speaking
    if (aiThinkingRef.current) {
      console.log('[Turn Control] Blocked: AI is still thinking.');
      return;
    }
    if (aiSpeakingRef.current) {
      // User is interrupting → cancel AI speech first
      handleUserInterrupt();
    }

    // Clear pending-response flag since user is responding now
    pendingResponseRef.current = false;
    clearSilenceTimers();

    if (!content.startsWith('[STAGE') && !content.startsWith('[SYSTEM')) {
      consecutiveSilenceCountRef.current = 0;
    }

    setAiThinking(true);
    aiThinkingRef.current = true;
    vadMethodsRef.current?.stop(); // Turn off mic while AI processes
    setAiCaption('');
    aiCaptionRef.current = '';

    try {
      const res = await fetch(`/api/interviews/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          requestRealtimeFeedback: false,
          code: showCodeEditor ? currentCode : undefined,
          language: showCodeEditor ? currentLanguage : undefined,
        }),
      });

      if (!res.ok) throw new Error('Send failed');

      const data = await res.json();

      // If the user ended the interview while the AI was thinking, drop the response
      if (interviewDoneRef.current) {
        return;
      }

      if (data.fillerAnalysis?.count > 0) {
        setTotalFillerWords(prev => prev + data.fillerAnalysis.count);
      }

      const aiContent = data.interviewerMessage.content;
      setAiThinking(false);
      aiThinkingRef.current = false;

      // TURN CONTROL: AI responds via TTS, then waits for user
      playTTS(aiContent);

      if (data.interviewComplete) {
        setInterviewDone(true);
        interviewDoneRef.current = true;
        vadMethodsRef.current?.stop();
        setTimeout(() => router.push(`/interview/${sessionId}/results`), 2000);
      }

    } catch {
      toast.error('Network error. Trying to reconnect...');
      setAiThinking(false);
      aiThinkingRef.current = false;
      // Reset silence state machine so it doesn't get permanently stuck
      silenceStageRef.current = 0;
      pendingResponseRef.current = false;
      vadMethodsRef.current?.start(); // Re-enable mic on failure
    }
  }, [sessionId, showCodeEditor, currentCode, currentLanguage, router, playTTS, handleUserInterrupt, clearSilenceTimers]);

  // ─── Whisper VAD Hook ─────────────────────────────────────────────────────
  const {
    isListening, isSpeaking, isTranscribing, transcript, conversationTurn,
    startListening, stopListening, pauseListening, resumeListening,
    notifyInterrupt, checkVoiceActivity, setTranscript
  } = useWhisperVAD(sendVoiceMessage);

  // Sync VAD methods ref (pause/resume keep stream alive; stop is only for full teardown)
  useEffect(() => {
    vadMethodsRef.current = { start: resumeListening, stop: pauseListening };
  }, [resumeListening, pauseListening]);

  // ─── Interrupt Detection: Poll for user voice while AI speaks ─────────────
  useEffect(() => {
    /* 
      DISABLED: Browser echo cancellation is not reliable enough without headphones.
      If enabled, the microphone often hears the AI's own voice from the speakers
      and falsely triggers an interrupt, cutting the AI off prematurely.
      
      if (aiSpeaking && hasStarted) {
        interruptCheckRef.current = setInterval(() => {
          if (checkVoiceActivity()) {
            notifyInterrupt();
            handleUserInterrupt();
            if (interruptCheckRef.current) {
              clearInterval(interruptCheckRef.current);
              interruptCheckRef.current = null;
            }
            vadMethodsRef.current?.start();
          }
        }, INTERRUPT_POLL_MS);
      }
    */
    return () => {
      if (interruptCheckRef.current) {
        clearInterval(interruptCheckRef.current);
        interruptCheckRef.current = null;
      }
    };
  }, [aiSpeaking, hasStarted, checkVoiceActivity, notifyInterrupt, handleUserInterrupt]);

  // ─── Track User Speaking State ────────────────────────────────────────────
  // If the user speaks at all during this turn, we disable the silence fail-safes
  useEffect(() => {
    if (isSpeaking) {
      hasSpokenThisTurnRef.current = true;
    }
  }, [isSpeaking]);

  // ─── Silence Detection: Fail-Safe Prompting ───────────────────────────────
  // Triggers ONLY when AI has finished speaking and user hasn't responded AT ALL
  useEffect(() => {
    if (!hasStarted || aiSpeaking || aiThinking || isSpeaking || isTranscribing || interviewDone || !pendingResponseRef.current || hasSpokenThisTurnRef.current) {
      clearSilenceTimers();
      return;
    }

    // Adaptive timing based on consecutive silences
    const adaptiveReduction = consecutiveSilenceCountRef.current * ADAPTIVE_REDUCTION_MS;
    const stage1Delay = Math.max(2000, STAGE_1_DELAY_MS - adaptiveReduction);
    const stage2Delay = Math.max(2000, STAGE_2_DELAY_MS - adaptiveReduction);
    const stage3Delay = Math.max(2000, STAGE_3_DELAY_MS - adaptiveReduction);

    if (silenceStageRef.current === 0) {
      silenceStage1Ref.current = setTimeout(() => {
        silenceStageRef.current = 1;
        consecutiveSilenceCountRef.current += 1;
        sendVoiceMessage("[STAGE 1 - GENTLE PROMPT]");
      }, stage1Delay);
    } else if (silenceStageRef.current === 1) {
      silenceStage2Ref.current = setTimeout(() => {
        silenceStageRef.current = 2;
        sendVoiceMessage("[STAGE 2 - CLARIFICATION/SUPPORT]");
      }, stage2Delay);
    } else if (silenceStageRef.current === 2) {
      silenceStage3Ref.current = setTimeout(() => {
        silenceStageRef.current = 0; // reset for next question
        sendVoiceMessage("[STAGE 3 - GRACEFUL TRANSITION]");
      }, stage3Delay);
    }

    return () => clearSilenceTimers();
  }, [hasStarted, aiSpeaking, aiThinking, isSpeaking, isTranscribing, interviewDone, sendVoiceMessage, clearSilenceTimers]);

  // ─── Cleanup on Unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopListening();
      clearSilenceTimers();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [stopListening, clearSilenceTimers]);

  // ─── Termination Handler ──────────────────────────────────────────────────
  const handleTermination = useCallback(() => {
    setInterviewTerminated(true);
    setInterviewDone(true);
    interviewDoneRef.current = true;
    stopListening();
    clearSilenceTimers();
    window.speechSynthesis.cancel();

    try {
      fetch(`/api/interviews/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: "[SYSTEM: Candidate violated tab-switching policy 3 times. Terminate the interview immediately.]",
        }),
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => router.push(`/interview/${sessionId}/results`), 4000);
  }, [sessionId, router, stopListening, clearSilenceTimers]);

  const {
    violations,
    maxViolations,
    isWarningVisible,
    dismissWarning
  } = useTabSwitchDetection({
    sessionId,
    maxViolations: 3,
    onTerminate: handleTermination,
    enabled: hasStarted && !interviewDone && (advancedSettings?.tabMonitoring !== false)
  });

  const {
    isFullscreen,
    enterFullscreen,
    violations: fsViolations,
    maxViolations: fsMaxViolations,
    isWarningVisible: isFsWarningVisible
  } = useFullscreenEnforcement({
    sessionId,
    maxViolations: 3,
    onTerminate: handleTermination,
    enabled: hasStarted && !interviewDone && (advancedSettings?.fullscreenEnforcement !== false)
  });

  // ─── Start Interview ─────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    try {
      await startListening(); // Only called ONCE — stream stays alive for entire interview
      setHasStarted(true);

      // Force AI to send the first greeting
      sendVoiceMessage('Hello, I am ready to begin. Please introduce yourself and start the interview.');
    } catch (e) {
      toast.error('Could not access microphone.');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const endInterview = async () => {
    if (!confirm('End interview and see results?')) return;
    stopListening(); // Full teardown on manual end
    clearSilenceTimers();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    router.push(`/interview/${sessionId}/results`);
  };

  // ─── Helper: Get turn status label and color ──────────────────────────────
  const getTurnStatus = (): { label: string; color: string; bgColor: string } => {
    if (aiSpeaking) return { label: 'AI is speaking...', color: 'text-brand-400', bgColor: 'bg-brand-500/20' };
    if (aiThinking) return { label: 'AI is analyzing...', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
    if (isTranscribing) return { label: 'Processing your audio...', color: 'text-amber-300', bgColor: 'bg-amber-500/20' };
    if (isSpeaking) return { label: 'Hearing you...', color: 'text-green-400', bgColor: 'bg-green-500/30' };
    if (isListening) return { label: 'Your turn — speak now', color: 'text-slate-300', bgColor: 'bg-brand-500/20' };
    return { label: 'Microphone off', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const turnStatus = getTurnStatus();

  // ─── Render: Terminated ───────────────────────────────────────────────────
  if (interviewTerminated) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md w-full text-center bg-slate-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Interview Terminated</h1>
          <p className="text-slate-300 mb-6">
            Your interview session was ended automatically due to multiple tab-switch or window-minimize violations.
          </p>
          <p className="text-slate-500 text-sm animate-pulse">
            Saving progress and redirecting to results...
          </p>
        </div>
      </div>
    );
  }

  // ─── Render: Start Screen ─────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <InterviewBootSequence 
        onComplete={handleStartInterview} 
        onEnterFullscreen={enterFullscreen}
      />
    );
  }
  // ─── Render: Active Interview ─────────────────────────────────────────────
  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 overflow-hidden text-white font-sans relative selection:bg-indigo-500/30">
      
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgqbm9pc2VGaWx0ZXIpIi8+PC9zdmc+')] opacity-[0.015]" />
      </div>

      {/* ─── HEADER ─── */}
      <header className="relative z-20 flex items-center justify-between px-8 py-4 bg-white/[0.01] backdrop-blur-2xl border-b border-white/[0.05] shadow-lg shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.2)] border border-white/10">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-wide text-white">Interview Session</h1>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-indigo-400 font-semibold mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Realtime Intelligence Active
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 pl-6 border-l border-white/10 h-8">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold tracking-widest uppercase">
              <Shield className="w-3.5 h-3.5" /> Secure E2E
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-lg font-mono text-[14px] text-white/90 shadow-inner">
            <Clock className="w-4 h-4 text-indigo-400" />
            {formatTime(elapsed)}
          </div>

          <button
            onClick={() => setShowCodeEditor(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-[13px] font-bold uppercase tracking-wider ${
              showCodeEditor ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Code2 className="w-4 h-4" /> Code
          </button>

          <button
            onClick={endInterview}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[13px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          >
            <X className="w-4 h-4" /> End
          </button>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col p-8 gap-6 relative z-10 overflow-hidden">
        
        {/* TOP ROW: 3 Columns (AI, Camera, Analytics) */}
        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* COLUMN 1: AI INTERVIEWER (3fr) */}
          <div className={`transition-all duration-500 flex flex-col gap-6 ${showCodeEditor ? 'hidden' : 'w-[30%]'}`}>
            <div className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm group">
              {/* Header */}
              <div className="flex justify-between items-center z-10 mb-6">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-bold text-white tracking-widest uppercase">AI Interviewer</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 uppercase tracking-widest ${
                  aiSpeaking ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                  aiThinking ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' :
                  'border-white/5 bg-white/[0.02] text-white/30'
                }`}>
                  {aiSpeaking ? 'Speaking' : aiThinking ? 'Processing' : 'Listening'}
                </div>
              </div>

              {/* Avatar Center */}
              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="relative">
                  <AIAvatar isSpeaking={aiSpeaking} isThinking={aiThinking} />
                  
                  {/* Ambient Glow behind Avatar */}
                  <div className={`absolute inset-0 rounded-full blur-[50px] -z-10 transition-all duration-700 ${
                    aiSpeaking ? 'bg-indigo-500/30 scale-150' : aiThinking ? 'bg-amber-500/20 scale-125' : 'bg-transparent scale-100'
                  }`} />
                </div>
              </div>

              {/* Bottom Visualizer */}
              <div className="h-16 flex items-center justify-center z-10 mt-6 border-t border-white/5 pt-6">
                {aiSpeaking ? (
                  <div className="flex gap-1.5 items-center h-8">
                    {[...Array(16)].map((_, i) => {
                      // Generate random waveform delays for natural look
                      const duration = 0.4 + Math.random() * 0.4;
                      return (
                        <motion.div 
                          key={i} 
                          animate={{ height: ['20%', `${40 + Math.random() * 60}%`, '20%'] }} 
                          transition={{ repeat: Infinity, duration, delay: i * 0.05 }} 
                          className="w-1.5 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(129,140,248,0.5)]" 
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full h-[1px] bg-white/5 relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: CAMERA PANEL (5fr) */}
          <div className={`transition-all duration-500 flex flex-col ${showCodeEditor ? 'w-1/2' : 'w-[50%]'}`}>
            <div className="flex-1 bg-slate-900 border border-white/[0.08] rounded-3xl relative overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/5 group">
              
              <div className="absolute top-6 left-6 z-20 flex gap-3">
                <div className="bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
                  <span className="text-[11px] font-bold text-white tracking-widest uppercase">Candidate</span>
                </div>
                <div className="bg-black/60 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-lg">
                  <div className="w-4 h-4 rounded border border-green-500 flex items-center justify-center border-dashed">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-[11px] font-bold text-green-400 tracking-widest uppercase">Tracking</span>
                </div>
              </div>

              {/* Proctoring Frame */}
              <div className="absolute inset-6 border border-white/5 rounded-xl pointer-events-none z-10 transition-colors group-hover:border-white/10" />
              
              {/* Corner crosshairs */}
              <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-white/20 z-10 pointer-events-none" />
              <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-white/20 z-10 pointer-events-none" />
              <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-white/20 z-10 pointer-events-none" />
              <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-white/20 z-10 pointer-events-none" />

              <div className="flex-1 w-full h-full [&>div]:h-full [&>div]:w-full relative z-0">
                <ProctoringSystem sessionId={sessionId} fullScreenMode={true} onStatusChange={setFaceStatus} enabled={advancedSettings?.faceTracking !== false} />
              </div>
            </div>
          </div>

          {/* COLUMN 3: ANALYTICS SIDEBAR (2fr) */}
          <div className={`transition-all duration-500 flex flex-col gap-6 ${showCodeEditor ? 'w-1/2' : 'w-[20%]'}`}>
            {showCodeEditor ? (
              <div className="flex-1 bg-slate-900 rounded-3xl border border-white/[0.05] shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                 <CodeEditor sessionId={sessionId} onCodeChange={setCurrentCode} onLanguageChange={setCurrentLanguage} />
              </div>
            ) : (
              <div className="flex-1 bg-slate-900 border border-white/[0.05] rounded-3xl p-6 relative overflow-hidden flex flex-col shadow-2xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                  <Server className="w-4 h-4 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">Session Status</span>
                </div>

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-none">
                  
                  {/* Secure Connection */}
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Secure Connection</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>

                  {/* Camera Active */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-colors ${camActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{camActive ? 'Camera Active' : 'Camera Disconnected'}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${camActive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-ping'}`} />
                  </div>

                  {/* Face Tracking */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-colors ${faceStatus === 'FACE_VISIBLE' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : faceStatus === 'DISABLED' ? 'text-slate-400 bg-slate-500/10 border-slate-500/20' : faceStatus === 'DETECTING' ? 'text-slate-400 bg-slate-500/10 border-slate-500/20' : faceStatus === 'LOOKING_AWAY' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        {faceStatus === 'FACE_VISIBLE' ? 'Face Tracking Active' : faceStatus === 'DISABLED' ? 'Face Tracking Disabled' : faceStatus === 'DETECTING' ? 'Initializing Vision...' : faceStatus === 'LOOKING_AWAY' ? 'Gaze Warning' : 'Face Missing'}
                      </span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${faceStatus === 'FACE_VISIBLE' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : faceStatus === 'DISABLED' ? 'bg-slate-500' : faceStatus === 'DETECTING' ? 'bg-slate-400' : faceStatus === 'LOOKING_AWAY' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                  </div>

                  {/* Audio/Mic */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-colors ${!isListening && !aiSpeaking ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <Mic className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{!isListening && !aiSpeaking ? 'Voice Stream Paused' : 'Voice Stream Stable'}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${!isListening && !aiSpeaking ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'}`} />
                  </div>

                  {/* Fullscreen Enforcement */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-colors ${isFullscreen ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{isFullscreen ? 'Fullscreen Active' : 'Fullscreen Exited'}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${isFullscreen ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                  </div>

                  {/* Focus & Tab Checking */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-colors ${!document.hidden ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{!document.hidden ? 'Focus Lock Active' : 'Tab Violation'}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${!document.hidden ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                  </div>

                  {/* Network Status */}
                  <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border backdrop-blur-sm transition-colors ${netStatus === 'Stable' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                    <div className="flex items-center gap-2">
                      <Wifi className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">{netStatus === 'Stable' ? 'Network Stable' : 'Network Disconnected'}</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${netStatus === 'Stable' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-400 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]'}`} />
                  </div>

                  {/* Database Recording */}
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border text-rose-400 bg-rose-500/10 border-rose-500/20 backdrop-blur-sm mt-auto">
                    <div className="flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 opacity-80" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Session Recording</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  </div>
                  
                </div>
              </div>
            )}
          </div>

        </div>

        {/* BOTTOM ROW: Full Width Transcript */}
        <div className="h-28 bg-slate-900 border border-white/[0.05] rounded-3xl p-5 shadow-2xl flex flex-col relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 h-full" />
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Transcript</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 space-y-2 scrollbar-none">
            <AnimatePresence mode="popLayout">
              {aiCaption && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-4 items-start">
                  <span className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-widest w-8 shrink-0">AI</span>
                  <p className="text-[14px] text-white/90 leading-relaxed font-medium">{aiCaption}</p>
                </motion.div>
              )}
              {transcript && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-4 items-start">
                  <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest w-8 shrink-0">You</span>
                  <p className="text-[14px] text-slate-300 leading-relaxed">"{transcript}"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* ─── FLOATING CONTROL DOCK ─── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-full p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
          
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/5">
            {isListening ? (
              <div className="relative group cursor-pointer" onClick={() => vadMethodsRef.current?.stop()}>
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-50" />
                <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:bg-green-500/20 transition-all">
                  <Mic className="w-5 h-5" />
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 cursor-pointer hover:bg-red-500/20 transition-all" onClick={() => vadMethodsRef.current?.start()}>
                <MicOff className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-white/10 mx-1" />

          <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-all">
            <Video className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-all" onClick={enterFullscreen}>
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-all">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TabWarningModal isVisible={isWarningVisible} violations={violations} maxViolations={maxViolations} onDismiss={dismissWarning} />
      <FullscreenWarningModal isVisible={hasStarted && !interviewDone && (!isFullscreen || isFsWarningVisible)} violations={fsViolations} maxViolations={fsMaxViolations} onEnterFullscreen={enterFullscreen} />
    </div>
  );
}
