import type { InputPosition } from "../types/InputEvent";

/**
 * Configuration for click detection.
 */
export interface ClickConfig {
  timeout?: number; // Max milliseconds between clicks (default: 300)
  radius?: number; // Max pixels between clicks (default: 5)
  onClick?: (position: InputPosition, button: number) => void;
  onDoubleClick?: (position: InputPosition, button: number) => void;
  onTripleClick?: (position: InputPosition, button: number) => void;
  onNClick?: (count: number, position: InputPosition, button: number) => void;
}

/**
 * Configuration for long press detection.
 */
export interface LongPressConfig {
  duration?: number; // Milliseconds to hold (default: 500)
  tolerance?: number; // Max pixels to move (default: 10)
  onStart?: (position: InputPosition) => void;
  onUpdate?: (position: InputPosition, elapsed: number) => void;
  onLongPress?: (position: InputPosition, elapsed: number) => void;
  onEnd?: (position: InputPosition) => void;
  onCancel?: (reason: string) => void;
}
