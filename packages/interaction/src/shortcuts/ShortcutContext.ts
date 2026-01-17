/**
 * Context identifiers for context-aware shortcuts.
 */
export enum ShortcutContext {
  Global = "global",
  Canvas = "canvas",
  TextInput = "text-input",
  Menu = "menu",
  Dialog = "dialog",
}

/**
 * Checks if a context matches another (supports hierarchy).
 */
export function matchesContext(context: string, target: string): boolean {
  if (context === target) return true;
  // Global context matches everything
  const globalContext = ShortcutContext.Global as string;
  if (target === globalContext || context === globalContext) return true;
  return false;
}
