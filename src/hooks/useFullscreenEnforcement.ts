import { useState, useEffect, useRef, useCallback } from 'react';

interface UseFullscreenEnforcementProps {
  sessionId: string;
  maxViolations?: number;
  onTerminate: () => void;
  enabled?: boolean;
}

export function useFullscreenEnforcement({
  sessionId,
  maxViolations = 3,
  onTerminate,
  enabled = true
}: UseFullscreenEnforcementProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violations, setViolations] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return parseInt(sessionStorage.getItem(`fs_violations_${sessionId}`) || '0', 10);
    }
    return 0;
  });
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  const enabledRef = useRef(enabled);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`fs_violations_${sessionId}`, violations.toString());
    }
  }, [violations, sessionId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsFullscreen(!!document.fullscreenElement);
    }
  }, []);

  const handleViolation = useCallback(() => {
    if (!enabledRef.current) return;
    
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      setViolations(prev => {
        const newCount = prev + 1;
        if (newCount >= maxViolations) {
          onTerminate();
        } else {
          setIsWarningVisible(true);
        }
        return newCount;
      });
    }, 300);
  }, [maxViolations, onTerminate]);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setIsWarningVisible(false);
    } catch (err) {
      console.warn("Fullscreen request failed", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFullscreenChange = () => {
      const currentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(currentlyFullscreen);

      if (!currentlyFullscreen && enabledRef.current) {
        handleViolation();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [handleViolation]);

  return {
    isFullscreen,
    enterFullscreen,
    violations,
    maxViolations,
    isWarningVisible
  };
}
