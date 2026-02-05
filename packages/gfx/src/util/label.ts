/**
 * @arcanvas/gfx - Debug labeling utilities
 *
 * Helpers for managing debug labels on GPU objects.
 */

// ============================================================================
// Label Generation
// ============================================================================

let globalLabelCounter = 0;

/**
 * Generate a unique label for a resource type.
 */
export function generateLabel(prefix: string): string {
  return `${prefix}_${++globalLabelCounter}`;
}

/**
 * Reset the label counter (useful for tests).
 */
export function resetLabelCounter(): void {
  globalLabelCounter = 0;
}

/**
 * Get the current label counter value.
 */
export function getLabelCounter(): number {
  return globalLabelCounter;
}

// ============================================================================
// Label Formatting
// ============================================================================

/**
 * Format a label with optional parent context.
 */
export function formatLabel(base: string, parent?: string): string {
  if (parent) {
    return `${parent}/${base}`;
  }
  return base;
}

/**
 * Truncate a label to a maximum length.
 */
export function truncateLabel(label: string, maxLength: number = 64): string {
  if (label.length <= maxLength) {
    return label;
  }
  return label.slice(0, maxLength - 3) + "...";
}

// ============================================================================
// Debug Marker Scope
// ============================================================================

/**
 * Scoped debug group helper.
 * Use with any encoder that has pushDebugGroup/popDebugGroup.
 */
export interface DebugGroupScope {
  pushDebugGroup(label: string): void;
  popDebugGroup(): void;
}

/**
 * Execute a function within a debug group scope.
 */
export function withDebugGroup<T>(scope: DebugGroupScope, label: string, fn: () => T): T {
  scope.pushDebugGroup(label);
  try {
    return fn();
  } finally {
    scope.popDebugGroup();
  }
}

/**
 * Execute an async function within a debug group scope.
 */
export async function withDebugGroupAsync<T>(scope: DebugGroupScope, label: string, fn: () => Promise<T>): Promise<T> {
  scope.pushDebugGroup(label);
  try {
    return await fn();
  } finally {
    scope.popDebugGroup();
  }
}

// ============================================================================
// Debug Utilities
// ============================================================================

/**
 * Options for debug output.
 */
export interface DebugOptions {
  /** Enable verbose logging */
  verbose?: boolean;
  /** Include timestamps */
  timestamps?: boolean;
  /** Custom logger function */
  logger?: (message: string) => void;
}

/**
 * Create a debug logger.
 */
export function createDebugLogger(prefix: string, options: DebugOptions = {}): (message: string) => void {
  const { verbose = false, timestamps = false, logger = console.log } = options;

  if (!verbose) {
    return () => {};
  }

  return (message: string) => {
    const parts = [prefix];
    if (timestamps) {
      parts.unshift(`[${new Date().toISOString()}]`);
    }
    parts.push(message);
    logger(parts.join(" "));
  };
}
