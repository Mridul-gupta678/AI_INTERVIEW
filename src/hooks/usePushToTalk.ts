'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export function usePushToTalk() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (recognitionRef.current) return true;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Please use Chrome/Edge.');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep true so it doesn't stop randomly while holding space
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
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
        finalTranscriptRef.current += currentFinal + ' ';
      }

      const latestText = (finalTranscriptRef.current + currentInterim).trim();
      setTranscript(latestText);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setIsRecording(false);
        toast.error('Microphone access denied.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    return true;
  }, []);

  useEffect(() => {
    initRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [initRecognition]);

  const startRecording = useCallback(() => {
    if (!recognitionRef.current) {
      const init = initRecognition();
      if (!init) return;
    }
    
    finalTranscriptRef.current = '';
    setTranscript('');
    setIsRecording(true);
    
    try {
      recognitionRef.current.start();
    } catch (e) {}
  }, [initRecognition]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = '';
    setTranscript('');
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    transcript,
    clearTranscript
  };
}
