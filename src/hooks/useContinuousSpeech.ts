'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useContinuousSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>('');
  const ignoreResultRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout>();

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome/Edge.');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      clearTimeout(restartTimeoutRef.current);
    };

    recognition.onresult = (event: any) => {
      if (ignoreResultRef.current) return;
      
      let currentInterim = '';
      let currentFinal = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentFinal += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (currentFinal) {
        fullTranscriptRef.current += currentFinal + ' ';
      }

      const latestText = (fullTranscriptRef.current + currentInterim).trim();
      setTranscript(latestText);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsListening(false);
        isListeningRef.current = false;
        toast.error('Microphone access denied. Please allow microphone permissions.');
      }
      // "no-speech" and "aborted" are extremely common and can be safely ignored
    };

    recognition.onend = () => {
      // Auto-restart if we are supposed to be listening (persistent VAD)
      if (isListeningRef.current) {
        // Use a slight delay to prevent strict browser rate-limiting exceptions
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignore already started errors
            }
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, []);

  useEffect(() => {
    initRecognition();
    return () => {
      isListeningRef.current = false;
      setIsListening(false);
      clearTimeout(restartTimeoutRef.current);
      
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.abort(); // Force abort, not just stop
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [initRecognition]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      const initialized = initRecognition();
      if (!initialized) return; // Browser doesn't support it
    }
    
    setIsListening(true);
    isListeningRef.current = true;
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Ignore if already started
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    clearTimeout(restartTimeoutRef.current);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const clearTranscript = useCallback(() => {
    fullTranscriptRef.current = '';
    setTranscript('');
    ignoreResultRef.current = true;
    
    // Restart recognition to completely clear the browser's internal buffer
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    
    // Re-enable processing after the ghost onresult event passes
    setTimeout(() => {
      ignoreResultRef.current = false;
    }, 500);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript
  };
}
