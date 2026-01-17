// @arcanvas/interaction - Input interaction core for Arcanvas
// A standalone, dependency-free package for normalizing and abstracting input interactions

// Types
export { InputDevice } from "./src/types/InputDevice";
export type { ControllerState, InputEventType, InputPosition, NormalizedInputEvent, PenProperties, TouchPoint } from "./src/types/InputEvent";
export * from "./src/types/KeyCodeNumbers";
export * from "./src/types/KeyCodes";
export * from "./src/types/KeyConstants";
export { ModifierKey } from "./src/types/ModifierKey";
export { MouseButton } from "./src/types/MouseButton";
export { PointerType } from "./src/types/PointerType";

// Event Normalization
export { EventNormalizer, normalizeEvent } from "./src/events/EventNormalizer";

// Input State
export { InputState } from "./src/state/InputState";
export type { ClickEvent, InputStateSnapshot, PointerState } from "./src/state/InputState";

// Chords
export { Chord } from "./src/chords/Chord";
export { ChordMatcher } from "./src/chords/ChordMatcher";
export { parseChord, parseMouseChord } from "./src/chords/ChordParser";

// Shortcuts (Optional)
export { ShortcutBinding } from "./src/shortcuts/ShortcutBinding";
export type { ChordSequence } from "./src/shortcuts/ShortcutBinding";
export { matchesContext, ShortcutContext } from "./src/shortcuts/ShortcutContext";
export { ShortcutEngine } from "./src/shortcuts/ShortcutEngine";
export type { ActionEvent, ShortcutEngineOptions } from "./src/shortcuts/ShortcutEngine";

// Gestures
export { GestureState } from "./src/gestures/Gesture";
export type { GestureHandler } from "./src/gestures/Gesture";
export { GestureDetector } from "./src/gestures/GestureDetector";
export { PanGesture } from "./src/gestures/PanGesture";
export type { PanGestureConfig } from "./src/gestures/PanGesture";
export { PinchGesture } from "./src/gestures/PinchGesture";
export type { PinchGestureConfig } from "./src/gestures/PinchGesture";
export { RotateGesture } from "./src/gestures/RotateGesture";
export type { RotateGestureConfig } from "./src/gestures/RotateGesture";
export { SwipeDirection, SwipeGesture } from "./src/gestures/SwipeGesture";
export type { SwipeGestureConfig } from "./src/gestures/SwipeGesture";

// Clicks
export type { ClickConfig, LongPressConfig } from "./src/clicks/ClickConfig";
export { ClickDetector } from "./src/clicks/ClickDetector";
export { LongPressDetector } from "./src/clicks/LongPressDetector";

// Devices
export { ControllerAxis, ControllerButton, ControllerDevice } from "./src/devices/ControllerDevice";
export type { ControllerDeadzones, ControllerDeviceOptions } from "./src/devices/ControllerDevice";
export { DeviceDetector } from "./src/devices/DeviceDetector";
export { KeyboardDevice } from "./src/devices/KeyboardDevice";
export { MouseDevice } from "./src/devices/MouseDevice";
export { PenButton, PenDevice } from "./src/devices/PenDevice";
export { TouchDevice } from "./src/devices/TouchDevice";

