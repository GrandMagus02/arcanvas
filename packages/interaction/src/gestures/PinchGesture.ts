import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import { GestureState } from "./Gesture";

/**
 * Configuration for PinchGesture.
 */
export interface PinchGestureConfig {
  minDistance?: number; // Minimum distance between touches to start (default: 10)
  onStart?: (centerX: number, centerY: number, distance: number, event: NormalizedInputEvent) => void;
  onUpdate?: (scale: number, centerX: number, centerY: number, distance: number, event: NormalizedInputEvent) => void;
  onEnd?: (scale: number, event: NormalizedInputEvent) => void;
  onCancel?: (reason: string) => void;
}

/**
 * Pinch/zoom gesture detector for two-finger zoom.
 */
export class PinchGesture {
  private _state: GestureState = GestureState.Idle;
  private _initialDistance: number = 0;
  private _lastDistance: number = 0;
  private _touchIds: number[] = [];
  private _config: Required<PinchGestureConfig>;

  constructor(config: PinchGestureConfig = {}) {
    this._config = {
      minDistance: config.minDistance ?? 10,
      onStart: config.onStart ?? (() => {}),
      onUpdate: config.onUpdate ?? (() => {}),
      onEnd: config.onEnd ?? (() => {}),
      onCancel: config.onCancel ?? (() => {}),
    };
  }

  /**
   * Calculates distance between two touch points.
   */
  private _calculateDistance(touch1: { x: number; y: number }, touch2: { x: number; y: number }): number {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculates center point between two touches.
   */
  private _calculateCenter(touch1: { x: number; y: number }, touch2: { x: number; y: number }): { x: number; y: number } {
    return {
      x: (touch1.x + touch2.x) / 2,
      y: (touch1.y + touch2.y) / 2,
    };
  }

  /**
   * Handles an input event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(event: NormalizedInputEvent, _state: InputState): void {
    if (!event.touches || event.touches.length < 2) {
      if (this._state === GestureState.Active) {
        this._config.onEnd(this._lastDistance / this._initialDistance, event);
        this._state = GestureState.Complete;
      }
      this._touchIds = [];
      return;
    }

    const touches = event.touches;
    const touch1 = touches[0];
    const touch2 = touches[1];

    if (this._state === GestureState.Idle) {
      if (event.type === "touchstart" && touches.length === 2) {
        const distance = this._calculateDistance(touch1.position, touch2.position);
        if (distance >= this._config.minDistance) {
          this._initialDistance = distance;
          this._lastDistance = distance;
          this._touchIds = [touch1.identifier, touch2.identifier];
          this._state = GestureState.Active;
          const center = this._calculateCenter(touch1.position, touch2.position);
          this._config.onStart(center.x, center.y, distance, event);
        }
      }
    } else if (this._state === GestureState.Active) {
      if (event.type === "touchmove") {
        // Verify we still have the same two touches
        const hasTouch1 = touches.some((t) => t.identifier === this._touchIds[0]);
        const hasTouch2 = touches.some((t) => t.identifier === this._touchIds[1]);

        if (hasTouch1 && hasTouch2 && touches.length >= 2) {
          const currentTouch1 = touches.find((t) => t.identifier === this._touchIds[0])!;
          const currentTouch2 = touches.find((t) => t.identifier === this._touchIds[1])!;
          const distance = this._calculateDistance(currentTouch1.position, currentTouch2.position);
          const scale = distance / this._initialDistance;
          const center = this._calculateCenter(currentTouch1.position, currentTouch2.position);
          this._config.onUpdate(scale, center.x, center.y, distance, event);
          this._lastDistance = distance;
        }
      } else if (event.type === "touchend" || event.type === "touchcancel") {
        this._config.onEnd(this._lastDistance / this._initialDistance, event);
        this._state = GestureState.Complete;
        this._touchIds = [];
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
    this._initialDistance = 0;
    this._lastDistance = 0;
    this._touchIds = [];
  }
}
