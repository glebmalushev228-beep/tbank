import { useEffect, useRef, useState } from 'react';

/**
 * Keeps a sheet mounted long enough to play its closing animation.
 * Unmounting is timer based, so a throttled animation timeline can never
 * leave an invisible overlay blocking the app.
 */
export function usePresence(open: boolean, exitDuration = 280) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, exitDuration);
    return () => window.clearTimeout(timer);
  }, [open, exitDuration]);

  return { mounted, closing };
}
