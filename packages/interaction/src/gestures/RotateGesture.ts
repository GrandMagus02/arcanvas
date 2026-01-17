import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import { GestureState } from "./Gesture";

/**
 * Configuration for RotateGesture.
 */
export interface RotateGestureConfig {
  minAngle?: number; // Minimum angle change in degrees to start (default: 5)
  onStart?: (centerX: number, centerY: number, angle: number, event: NormalizedInputEvent) => void;
  onUpdate?: (angle: number, deltaAngle: number, centerX: number, centerY: number, event: NormalizedInputEvent) => void;
  onEnd?: (totalAngle: number, event: NormalizedInputEvent) => void;
  onCancel?: (reason: string) => void;
}

/**
 * Rotation gesture detector for two-finger rotation.
 */
export class RotateGesture {
  private _state: GestureState = GestureState.Idle;
  private _initialAngle: number = 0;
  private _lastAngle: number = 0;
  private _totalAngle: number = 0;
  private _touchIds: number[] = [];
  private _config: Required<RotateGestureConfig>;

  constructor(config: RotateGestureConfig = {}) {
    this._config = {
      minAngle: config.minAngle ?? 5,
      onStart: config.onStart ?? (() => {}),
      onUpdate: config.onUpdate ?? (() => {}),
      onEnd: config.onEnd ?? (() => {}),
      onCancel: config.onCancel ?? (() => {}),
    };
  }

  /**
   * Calculates angle between two touch points relative to center.
   */
  private _calculateAngle(touch1: { x: number; y: number }, touch2: { x: number; y: number }): number {
    const dx = touch2.x - touch1.x;
    const dy = touch2.y - touch1.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
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
        this._config.onEnd(this._totalAngle, event);
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
        const angle = this._calculateAngle(touch1.position, touch2.position);
        this._initialAngle = angle;
        this._lastAngle = angle;
        this._totalAngle = 0;
        this._touchIds = [touch1.identifier, touch2.identifier];
        this._state = GestureState.Detecting;
      }
    } else if (this._state === GestureState.Detecting) {
      if (event.type === "touchmove") {
        const hasTouch1 = touches.some((t) => t.identifier === this._touchIds[0]);
        const hasTouch2 = touches.some((t) => t.identifier === this._touchIds[1]);

        if (hasTouch1 && hasTouch2 && touches.length >= 2) {
          const currentTouch1 = touches.find((t) => t.identifier === this._touchIds[0])!;
          const currentTouch2 = touches.find((t) => t.identifier === this._touchIds[1])!;
          const angle = this._calculateAngle(currentTouch1.position, currentTouch2.position);
          const deltaAngle = angle - this._initialAngle;

          if (Math.abs(deltaAngle) >= this._config.minAngle) {
            this._state = GestureState.Active;
            const center = this._calculateCenter(currentTouch1.position, currentTouch2.position);
            this._config.onStart(center.x, center.y, angle, event);
            this._config.onUpdate(angle, deltaAngle, center.x, center.y, event);
            this._lastAngle = angle;
            this._totalAngle = deltaAngle;
          }
        }
      }
    } else if (this._state === GestureState.Active) {
      if (event.type === "touchmove") {
        const hasTouch1 = touches.some((t) => t.identifier === this._touchIds[0]);
        const hasTouch2 = touches.some((t) => t.identifier === this._touchIds[1]);

        if (hasTouch1 && hasTouch2 && touches.length >= 2) {
          const currentTouch1 = touches.find((t) => t.identifier === this._touchIds[0])!;
          const currentTouch2 = touches.find((t) => t.identifier === this._touchIds[1])!;
          const angle = this._calculateAngle(currentTouch1.position, currentTouch2.position);
          const deltaAngle = angle - this._lastAngle;
          this._totalAngle += deltaAngle;
          const center = this._calculateCenter(currentTouch1.position, currentTouch2.position);
          this._config.onUpdate(angle, deltaAngle, center.x, center.y, event);
          this._lastAngle = angle;
        }
      } else if (event.type === "touchend" || event.type === "touchcancel") {
        this._config.onEnd(this._totalAngle, event);
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
    this._initialAngle = 0;
    this._lastAngle = 0;
    this._totalAngle = 0;
    this._touchIds = [];
  }
}
