import { useEffect, useCallback } from "react";

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't handle shortcuts if typing in an input field (except for save)
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      for (const shortcut of shortcuts) {
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.code.toLowerCase() === shortcut.key.toLowerCase();

        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          // For Ctrl+S, always allow (even in inputs)
          if (shortcut.ctrl && shortcut.key.toLowerCase() === "s") {
            event.preventDefault();
            shortcut.handler();
            return;
          }

          // For other shortcuts, skip if in input
          if (isInput) continue;

          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts that can be reused
export const SHORTCUT_KEYS = {
  SAVE: { key: "s", ctrl: true, description: "Save file" },
  TOGGLE_SIDEBAR: { key: "b", ctrl: true, description: "Toggle sidebar" },
  TOGGLE_TERMINAL: { key: "`", ctrl: true, description: "Toggle terminal" },
  NEW_FILE: { key: "n", ctrl: true, description: "New file" },
  OPEN_FOLDER: { key: "o", ctrl: true, shift: true, description: "Open folder" },
  CLOSE_TAB: { key: "w", ctrl: true, description: "Close tab" },
  NEXT_TAB: { key: "Tab", ctrl: true, description: "Next tab" },
  PREV_TAB: { key: "Tab", ctrl: true, shift: true, description: "Previous tab" },
  COMMAND_PALETTE: { key: "p", ctrl: true, shift: true, description: "Command palette" },
  QUICK_OPEN: { key: "p", ctrl: true, description: "Quick open" },
  FIND: { key: "f", ctrl: true, description: "Find" },
  REPLACE: { key: "h", ctrl: true, description: "Find and replace" },
} as const;
