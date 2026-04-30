import { useEffect } from 'react';

export function useKeyboardShortcut(shortcut: string, callback: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const keys = shortcut.toLowerCase().split('+');
      const modifiers = keys.slice(0, -1);
      const key = keys[keys.length - 1];

      const modifierPressed = modifiers.every(modifier => {
        switch (modifier) {
          case 'ctrl':
            return event.ctrlKey;
          case 'alt':
            return event.altKey;
          case 'shift':
            return event.shiftKey;
          case 'meta':
            return event.metaKey;
          default:
            return false;
        }
      });

      if (modifierPressed && event.key.toLowerCase() === key) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, callback, enabled]);
}