import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import type { GestureHandler } from "./Gesture";
import { PanGesture } from "./PanGesture";
import { PinchGesture } from "./PinchGesture";
import { RotateGesture } from "./RotateGesture";
import { SwipeGesture } from "./SwipeGesture";

/**
 * Gesture detector that manages multiple gesture types.
 */
export class GestureDetector {
  private _panGesture?: PanGesture;
  private _pinchGesture?: PinchGesture;
  private _rotateGesture?: RotateGesture;
  private _swipeGesture?: SwipeGesture;
  private _customHandlers: Array<{ handler: GestureHandler; enabled: boolean }> = [];

  /**
   * Enables pan gesture detection.
   */
  enablePan(config?: Parameters<typeof PanGesture.prototype.constructor>[0]): PanGesture {
    this._panGesture = new PanGesture(config);
    return this._panGesture;
  }

  /**
   * Enables pinch gesture detection.
   */
  enablePinch(config?: Parameters<typeof PinchGesture.prototype.constructor>[0]): PinchGesture {
    this._pinchGesture = new PinchGesture(config);
    return this._pinchGesture;
  }

  /**
   * Enables rotate gesture detection.
   */
  enableRotate(config?: Parameters<typeof RotateGesture.prototype.constructor>[0]): RotateGesture {
    this._rotateGesture = new RotateGesture(config);
    return this._rotateGesture;
  }

  /**
   * Enables swipe gesture detection.
   */
  enableSwipe(config?: Parameters<typeof SwipeGesture.prototype.constructor>[0]): SwipeGesture {
    this._swipeGesture = new SwipeGesture(config);
    return this._swipeGesture;
  }

  /**
   * Registers a custom gesture handler.
   */
  registerHandler(handler: GestureHandler): () => void {
    this._customHandlers.push({ handler, enabled: true });
    return () => {
      this._customHandlers = this._customHandlers.filter((h) => h.handler !== handler);
    };
  }

  /**
   * Processes an input event through all enabled gesture detectors.
   */
  handle(event: NormalizedInputEvent, state: InputState): void {
    if (this._panGesture) {
      this._panGesture.handle(event, state);
    }
    if (this._pinchGesture) {
      this._pinchGesture.handle(event, state);
    }
    if (this._rotateGesture) {
      this._rotateGesture.handle(event, state);
    }
    if (this._swipeGesture) {
      this._swipeGesture.handle(event, state);
    }

    // Handle custom handlers
    for (const { handler, enabled } of this._customHandlers) {
      if (!enabled) continue;

      if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
        handler.onStart?.(state, event, {});
      } else if (event.type === "mousemove" || event.type === "pointermove" || event.type === "touchmove") {
        handler.onUpdate?.(state, event, {});
      } else if (event.type === "mouseup" || event.type === "pointerup" || event.type === "touchend") {
        handler.onEnd?.(state, event, {});
      } else if (event.type === "pointercancel" || event.type === "touchcancel") {
        handler.onCancel?.(state, "Event cancelled", {});
      }
    }
  }

  /**
   * Resets all gestures.
   */
  reset(): void {
    this._panGesture?.reset();
    this._pinchGesture?.reset();
    this._rotateGesture?.reset();
    this._swipeGesture?.reset();
  }
}
