import type { InputState } from "../state/InputState";
import type { InputPosition, NormalizedInputEvent } from "../types/InputEvent";
import { GestureState } from "./Gesture";

/**
 * Configuration for PanGesture.
 */
export interface PanGestureConfig {
  threshold?: number; // Pixels to move before starting (default: 5)
  onStart?: (startPos: InputPosition, event: NormalizedInputEvent) => void;
  onUpdate?: (deltaX: number, deltaY: number, currentPos: InputPosition, startPos: InputPosition, event: NormalizedInputEvent) => void;
  onEnd?: (deltaX: number, deltaY: number, totalDistance: number, event: NormalizedInputEvent) => void;
  onCancel?: (reason: string) => void;
}

/**
 * Pan/drag gesture detector.
 * Generic drag detector usable for camera panning, object dragging, selection rectangle, drag-and-drop.
 */
export class PanGesture {
  private _state: GestureState = GestureState.Idle;
  private _startPos: InputPosition | null = null;
  private _lastPos: InputPosition | null = null;
  private _config: Required<PanGestureConfig>;

  constructor(config: PanGestureConfig = {}) {
    this._config = {
      threshold: config.threshold ?? 5,
      onStart: config.onStart ?? (() => {}),
      onUpdate: config.onUpdate ?? (() => {}),
      onEnd: config.onEnd ?? (() => {}),
      onCancel: config.onCancel ?? (() => {}),
    };
  }

  /**
   * Handles an input event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(event: NormalizedInputEvent, _state: InputState): void {
    if (this._state === GestureState.Idle) {
      if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
        if (event.buttons.length > 0) {
          this._startPos = event.position;
          this._lastPos = event.position;
          this._state = GestureState.Detecting;
        }
      }
    } else if (this._state === GestureState.Detecting) {
      if (event.type === "mousemove" || event.type === "pointermove" || event.type === "touchmove") {
        if (this._startPos) {
          const dx = event.position.x - this._startPos.x;
          const dy = event.position.y - this._startPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance >= this._config.threshold) {
            this._state = GestureState.Active;
            this._config.onStart(this._startPos, event);
            this._config.onUpdate(dx, dy, event.position, this._startPos, event);
            this._lastPos = event.position;
          }
        }
      } else if (event.type === "mouseup" || event.type === "pointerup" || event.type === "touchend") {
        this._state = GestureState.Idle;
        this._startPos = null;
        this._lastPos = null;
      }
    } else if (this._state === GestureState.Active) {
      if (event.type === "mousemove" || event.type === "pointermove" || event.type === "touchmove") {
        if (this._startPos) {
          const dx = event.position.x - this._startPos.x;
          const dy = event.position.y - this._startPos.y;
          this._config.onUpdate(dx, dy, event.position, this._startPos, event);
          this._lastPos = event.position;
        }
      } else if (event.type === "mouseup" || event.type === "pointerup" || event.type === "touchend" || event.type === "pointercancel" || event.type === "touchcancel") {
        if (this._startPos && this._lastPos) {
          const dx = this._lastPos.x - this._startPos.x;
          const dy = this._lastPos.y - this._startPos.y;
          const totalDistance = Math.sqrt(dx * dx + dy * dy);
          this._config.onEnd(dx, dy, totalDistance, event);
        }
        this._state = GestureState.Complete;
        this._startPos = null;
        this._lastPos = null;
      }
    }

    // Reset on cancel
    if (event.type === "pointercancel" || event.type === "touchcancel") {
      if (this._state !== GestureState.Idle) {
        this._config.onCancel("Event cancelled");
        this._state = GestureState.Cancelled;
        this._startPos = null;
        this._lastPos = null;
      }
    }
  }

  /**
   * Gets the current gesture state.
   */
  get state(): GestureState {
    return this._state;
  }

  /**
   * Resets the gesture to idle state.
   */
  reset(): void {
    this._state = GestureState.Idle;
    this._startPos = null;
    this._lastPos = null;
  }
}
