/**
 * Normalizes key names to a consistent format.
 * Handles browser differences and case normalization.
 */
export function normalizeKey(key: string): string {
  // Convert to lowercase for consistency
  const normalized = key.toLowerCase();

  // Handle special keys
  const specialKeys: Record<string, string> = {
    " ": "Space",
    arrowup: "ArrowUp",
    arrowdown: "ArrowDown",
    arrowleft: "ArrowLeft",
    arrowright: "ArrowRight",
    escape: "Escape",
    enter: "Enter",
    tab: "Tab",
    backspace: "Backspace",
    delete: "Delete",
    insert: "Insert",
    home: "Home",
    end: "End",
    pagedown: "PageDown",
    pageup: "PageUp",
    f1: "F1",
    f2: "F2",
    f3: "F3",
    f4: "F4",
    f5: "F5",
    f6: "F6",
    f7: "F7",
    f8: "F8",
    f9: "F9",
    f10: "F10",
    f11: "F11",
    f12: "F12",
  };

  if (specialKeys[normalized]) {
    return specialKeys[normalized];
  }

  // Return as-is for regular keys (will be lowercased)
  return normalized;
}
