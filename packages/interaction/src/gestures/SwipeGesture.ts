import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import { GestureState } from "./Gesture";

/**
 * Swipe direction.
 */
export enum SwipeDirection {
  Left = "left",
  Right = "right",
  Up = "up",
  Down = "down",
}

/**
 * Configuration for SwipeGesture.
 */
export interface SwipeGestureConfig {
  minVelocity?: number; // Minimum velocity in pixels/ms (default: 0.5)
  minDistance?: number; // Minimum distance in pixels (default: 50)
  direction?: SwipeDirection | "horizontal" | "vertical" | "both"; // Allowed directions (default: "both")
  onSwipe?: (direction: SwipeDirection, distance: number, velocity: number, event: NormalizedInputEvent) => void;
  onCancel?: (reason: string) => void;
}

/**
 * Swipe gesture detector for quick directional movements.
 */
export class SwipeGesture {
  private _state: GestureState = GestureState.Idle;
  private _startPos: { x: number; y: number; timestamp: number } | null = null;
  private _config: Required<SwipeGestureConfig>;

  constructor(config: SwipeGestureConfig = {}) {
    this._config = {
      minVelocity: config.minVelocity ?? 0.5,
      minDistance: config.minDistance ?? 50,
      direction: config.direction ?? "both",
      onSwipe: config.onSwipe ?? (() => {}),
      onCancel: config.onCancel ?? (() => {}),
    };
  }

  /**
   * Determines swipe direction from delta.
   */
  private _getDirection(dx: number, dy: number): SwipeDirection | null {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      return dx > 0 ? SwipeDirection.Right : SwipeDirection.Left;
    } else {
      return dy > 0 ? SwipeDirection.Down : SwipeDirection.Up;
    }
  }

  /**
   * Checks if direction is allowed.
   */
  private _isDirectionAllowed(direction: SwipeDirection): boolean {
    if (this._config.direction === "both") return true;
    if (this._config.direction === "horizontal") {
      return direction === SwipeDirection.Left || direction === SwipeDirection.Right;
    }
    if (this._config.direction === "vertical") {
      return direction === SwipeDirection.Up || direction === SwipeDirection.Down;
    }
    return direction === this._config.direction;
  }

  /**
   * Handles an input event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(event: NormalizedInputEvent, _state: InputState): void {
    if (this._state === GestureState.Idle) {
      if (event.type === "touchstart" || event.type === "mousedown" || event.type === "pointerdown") {
        this._startPos = {
          x: event.position.x,
          y: event.position.y,
          timestamp: event.timestamp,
        };
        this._state = GestureState.Detecting;
      }
    } else if (this._state === GestureState.Detecting || this._state === GestureState.Active) {
      if (event.type === "touchmove" || event.type === "mousemove" || event.type === "pointermove") {
        this._state = GestureState.Active;
      } else if (event.type === "touchend" || event.type === "mouseup" || event.type === "pointerup") {
        if (this._startPos) {
          const dx = event.position.x - this._startPos.x;
          const dy = event.position.y - this._startPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const time = event.timestamp - this._startPos.timestamp;
          const velocity = time > 0 ? distance / time : 0;

          if (distance >= this._config.minDistance && velocity >= this._config.minVelocity) {
            const direction = this._getDirection(dx, dy);
            if (direction && this._isDirectionAllowed(direction)) {
              this._config.onSwipe(direction, distance, velocity, event);
              this._state = GestureState.Complete;
            } else {
              this._state = GestureState.Idle;
            }
          } else {
            this._state = GestureState.Idle;
          }
        }
        this._startPos = null;
      } else if (event.type === "touchcancel" || event.type === "pointercancel") {
        this._config.onCancel("Event cancelled");
        this._state = GestureState.Cancelled;
        this._startPos = null;
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
  }
}
