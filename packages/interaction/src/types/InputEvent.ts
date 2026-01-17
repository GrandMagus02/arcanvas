import type { InputDevice } from "./InputDevice";
import type { ModifierKey } from "./ModifierKey";
import type { MouseButton } from "./MouseButton";
import type { PointerType } from "./PointerType";

/**
 * Normalized position information from input events.
 */
export interface InputPosition {
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  offsetX: number;
  offsetY: number;
  pageX: number;
  pageY: number;
}

/**
 * Pen-specific input properties.
 */
export interface PenProperties {
  pressure: number; // 0-1
  tiltX: number; // Angle in degrees
  tiltY: number; // Angle in degrees
  twist?: number; // Rotation around pen axis, if available
  isEraser: boolean; // True if eraser end is active
  barrelButton?: number; // Barrel button number (1, 2, etc.) if pressed
}

/**
 * Touch point information.
 */
export interface TouchPoint {
  identifier: number;
  position: InputPosition;
  radiusX?: number;
  radiusY?: number;
  rotationAngle?: number;
  force?: number;
}

/**
 * Controller button/axis information.
 */
export interface ControllerState {
  buttons: Map<string, boolean>; // Named buttons (A, B, X, Y, etc.)
  axes: Map<string, number>; // Named axes (leftStickX, leftStickY, etc.)
}

/**
 * Normalized input event type.
 */
export type InputEventType =
  | "keydown"
  | "keyup"
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "mouseleave"
  | "pointerdown"
  | "pointerup"
  | "pointermove"
  | "pointerleave"
  | "pointercancel"
  | "touchstart"
  | "touchend"
  | "touchmove"
  | "touchcancel"
  | "wheel"
  | "contextmenu";

/**
 * Normalized input event that abstracts away browser differences.
 */
export interface NormalizedInputEvent {
  type: InputEventType;
  device: InputDevice;
  timestamp: number;

  // Position information
  position: InputPosition;

  // Button and key states
  buttons: MouseButton[];
  key?: string; // Normalized key name
  code?: string; // Physical key code

  // Modifier keys
  modifiers: ModifierKey[];

  // Device-specific properties
  pointerType?: PointerType;
  pen?: PenProperties;
  touches?: TouchPoint[];
  controller?: ControllerState;

  // Wheel-specific
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
  deltaMode?: number;

  // Original event (for advanced use cases)
  originalEvent?: Event;
}
