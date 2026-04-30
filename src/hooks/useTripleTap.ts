import { useEffect, useRef } from 'react';

export function useTripleTap(onTripleTap: () => void, targetArea?: { x: number; y: number; width: number; height: number }, enabled: boolean = true) {
  const tapCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      // Check if touch is in target area (default to top-right corner)
      const area = targetArea || { x: window.innerWidth - 100, y: 0, width: 100, height: 100 };

      if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
        tapCountRef.current += 1;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (tapCountRef.current === 3) {
          onTripleTap();
          tapCountRef.current = 0;
        } else {
          timeoutRef.current = setTimeout(() => {
            tapCountRef.current = 0;
          }, 500); // Reset after 500ms
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTripleTap, targetArea, enabled]);
}