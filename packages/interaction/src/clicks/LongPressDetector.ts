import type { InputState } from "../state/InputState";
import type { InputPosition, NormalizedInputEvent } from "../types/InputEvent";
import type { LongPressConfig } from "./ClickConfig";

/**
 * Long press detector for hold gestures.
 */
export class LongPressDetector {
  private _config: Required<LongPressConfig>;
  private _pressStart: { position: InputPosition; timestamp: number } | null = null;
  private _longPressTimeout: number | null = null;
  private _updateInterval: number | null = null;
  private _isLongPressTriggered: boolean = false;

  constructor(config: LongPressConfig = {}) {
    this._config = {
      duration: config.duration ?? 500,
      tolerance: config.tolerance ?? 10,
      onStart: config.onStart ?? (() => {}),
      onUpdate: config.onUpdate ?? (() => {}),
      onLongPress: config.onLongPress ?? (() => {}),
      onEnd: config.onEnd ?? (() => {}),
      onCancel: config.onCancel ?? (() => {}),
    };
  }

  /**
   * Calculates distance between two positions.
   */
  private _distance(pos1: InputPosition, pos2: InputPosition): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Handles an input event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(event: NormalizedInputEvent, _state: InputState): void {
    if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
      if (event.buttons.length === 0) return;

      this._pressStart = {
        position: event.position,
        timestamp: event.timestamp,
      };
      this._isLongPressTriggered = false;
      this._config.onStart(event.position);

      // Set timeout for long press
      this._longPressTimeout = setTimeout(() => {
        if (this._pressStart) {
          this._isLongPressTriggered = true;
          const elapsed = Date.now() - this._pressStart.timestamp;
          this._config.onLongPress(this._pressStart.position, elapsed);
        }
        this._longPressTimeout = null;
      }, this._config.duration) as unknown as number;

      // Set up update interval
      this._updateInterval = setInterval(() => {
        if (this._pressStart) {
          const elapsed = Date.now() - this._pressStart.timestamp;
          this._config.onUpdate(this._pressStart.position, elapsed);
        }
      }, 16) as unknown as number; // ~60fps updates
    } else if (event.type === "mousemove" || event.type === "pointermove" || event.type === "touchmove") {
      if (this._pressStart) {
        const distance = this._distance(event.position, this._pressStart.position);
        if (distance > this._config.tolerance) {
          // Moved too far, cancel
          this._cancel("Moved beyond tolerance");
        }
      }
    } else if (event.type === "mouseup" || event.type === "pointerup" || event.type === "touchend") {
      if (this._pressStart) {
        this._config.onEnd(event.position);
      }
      this._cleanup();
    } else if (event.type === "pointercancel" || event.type === "touchcancel") {
      this._cancel("Event cancelled");
    }
  }

  /**
   * Cancels the long press.
   */
  private _cancel(reason: string): void {
    this._config.onCancel(reason);
    this._cleanup();
  }

  /**
   * Cleans up timers and state.
   */
  private _cleanup(): void {
    if (this._longPressTimeout) {
      clearTimeout(this._longPressTimeout);
      this._longPressTimeout = null;
    }
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    this._pressStart = null;
    this._isLongPressTriggered = false;
  }

  /**
   * Resets the detector state.
   */
  reset(): void {
    this._cleanup();
  }
}
