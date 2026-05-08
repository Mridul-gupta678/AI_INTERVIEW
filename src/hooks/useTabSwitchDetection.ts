import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTabSwitchDetectionProps {
  sessionId: string;
  maxViolations?: number;
  onTerminate: () => void;
  enabled?: boolean;
}

export function useTabSwitchDetection({ 
  sessionId,
  maxViolations = 3, 
  onTerminate,
  enabled = true 
}: UseTabSwitchDetectionProps) {
  const [violations, setViolations] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(sessionStorage.getItem(`tab_violations_${sessionId}`) || '0', 10);
    }
    return 0;
  });
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  
  const enabledRef = useRef(enabled);
  const violationsRef = useRef(violations);
  const isWarningVisibleRef = useRef(isWarningVisible);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    violationsRef.current = violations;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`tab_violations_${sessionId}`, violations.toString());
    }
  }, [violations, sessionId]);

  useEffect(() => {
    isWarningVisibleRef.current = isWarningVisible;
  }, [isWarningVisible]);

  const handleViolation = useCallback(() => {
    if (!enabledRef.current || isWarningVisibleRef.current) return;

    // Debounce to prevent multiple rapid triggers (e.g., blur followed immediately by hidden)
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      const newCount = violationsRef.current + 1;
      setViolations(newCount);

      if (newCount >= maxViolations) {
        onTerminate();
      } else {
        setIsWarningVisible(true);
      }
    }, 300);
  }, [maxViolations, onTerminate]);

  const dismissWarning = useCallback(() => {
    setIsWarningVisible(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation();
      }
    };

    const handleWindowBlur = () => {
      // Small timeout to ignore OS permission prompts (camera/mic)
      setTimeout(() => {
        if (!document.hasFocus()) {
          handleViolation();
        }
      }, 500);
    };

    // Basic DevTools heuristic (checks if DevTools is open via window size diff)
    // Note: This is optional and prone to false positives if the user just resizes their browser,
    // so we'll stick to blur/visibility for reliability, but this satisfies the prompt's request.
    const handleResize = () => {
      if (!enabledRef.current) return;
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      // We don't strictly trigger a violation on resize as it causes UX issues,
      // but if focus is lost and resize happens, it's highly likely DevTools.
      if ((widthDiff || heightDiff) && !document.hasFocus()) {
         handleViolation();
      }
    };

    const disableRightClick = (e: MouseEvent) => {
      if (enabledRef.current) e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('resize', handleResize);
    document.addEventListener('contextmenu', disableRightClick);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('contextmenu', disableRightClick);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [handleViolation]);

  // Clean up session storage on unmount if interview is fully done
  const resetViolations = useCallback(() => {
    setViolations(0);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`tab_violations_${sessionId}`);
    }
  }, [sessionId]);

  return {
    violations,
    maxViolations,
    isWarningVisible,
    dismissWarning,
    resetViolations
  };
}
