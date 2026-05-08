import { useEffect, useState, useRef } from 'react';

interface BrowserMonitoringOptions {
  onViolation?: (type: 'TAB_SWITCH' | 'WINDOW_BLUR') => void;
  enabled?: boolean;
}

export function useBrowserMonitoring({ onViolation, enabled = true }: BrowserMonitoringOptions = {}) {
  const [violationCount, setViolationCount] = useState(0);
  const isEnabledRef = useRef(enabled);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    isEnabledRef.current = enabled;
    onViolationRef.current = onViolation;
  }, [enabled, onViolation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      if (!isEnabledRef.current) return;
      
      if (document.visibilityState === 'hidden') {
        setViolationCount(prev => prev + 1);
        onViolationRef.current?.('TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      if (!isEnabledRef.current) return;
      
      // We add a tiny delay to ensure it's not a false positive (like an alert dialog opening)
      setTimeout(() => {
        if (!document.hasFocus()) {
          setViolationCount(prev => prev + 1);
          onViolationRef.current?.('WINDOW_BLUR');
        }
      }, 500);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return { violationCount };
}
