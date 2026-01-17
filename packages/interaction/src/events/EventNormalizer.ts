import { InputDevice } from "../types/InputDevice";
import type { InputPosition, NormalizedInputEvent, PenProperties, TouchPoint } from "../types/InputEvent";
import { ModifierKey } from "../types/ModifierKey";
import { MouseButton } from "../types/MouseButton";
import { PointerType } from "../types/PointerType";
import { normalizeKey } from "../utils/normalizeKey";

/**
 * Extended PointerEvent interface that includes pen-specific properties
 * that may not be in the standard TypeScript types.
 */
interface ExtendedPointerEvent extends PointerEvent {
  pointerType?: string;
  tiltX?: number;
  tiltY?: number;
  twist?: number;
}

/**
 * Extracts modifier keys from a DOM event.
 */
function extractModifiers(event: KeyboardEvent | MouseEvent | PointerEvent | WheelEvent): ModifierKey[] {
  const modifiers: ModifierKey[] = [];
  if (event.ctrlKey) modifiers.push(ModifierKey.Ctrl);
  if (event.shiftKey) modifiers.push(ModifierKey.Shift);
  if (event.altKey) modifiers.push(ModifierKey.Alt);
  if (event.metaKey) modifiers.push(ModifierKey.Meta);
  return modifiers;
}

/**
 * Extracts position information from a DOM event.
 */
function extractPosition(event: MouseEvent | PointerEvent | TouchEvent | WheelEvent, target?: Element): InputPosition {
  const rect = target?.getBoundingClientRect() ?? { left: 0, top: 0 };

  if ("touches" in event && event.touches.length > 0) {
    const touch = event.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      clientX: touch.clientX,
      clientY: touch.clientY,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      pageX: touch.pageX,
      pageY: touch.pageY,
    };
  }

  const mouseEvent = event as MouseEvent | PointerEvent | WheelEvent;
  return {
    x: mouseEvent.clientX - rect.left,
    y: mouseEvent.clientY - rect.top,
    clientX: mouseEvent.clientX,
    clientY: mouseEvent.clientY,
    offsetX: (mouseEvent as MouseEvent).offsetX ?? mouseEvent.clientX - rect.left,
    offsetY: (mouseEvent as MouseEvent).offsetY ?? mouseEvent.clientY - rect.top,
    pageX: (mouseEvent as MouseEvent).pageX ?? mouseEvent.clientX,
    pageY: (mouseEvent as MouseEvent).pageY ?? mouseEvent.clientY,
  };
}

/**
 * Extracts buttons from a mouse/pointer event.
 */
function extractButtons(event: MouseEvent | PointerEvent): MouseButton[] {
  const buttons: MouseButton[] = [];
  const button = event.button;
  const buttonsMask = "buttons" in event ? event.buttons : 0;

  // Check individual buttons
  if (buttonsMask & 1) buttons.push(MouseButton.Left);
  if (buttonsMask & 2) buttons.push(MouseButton.Right);
  if (buttonsMask & 4) buttons.push(MouseButton.Middle);
  if (buttonsMask & 8) buttons.push(MouseButton.Back);
  if (buttonsMask & 16) buttons.push(MouseButton.Forward);

  // If no buttons in mask but button is set, add it
  if (buttons.length === 0 && button !== undefined) {
    buttons.push(button as MouseButton);
  }

  return buttons;
}

/**
 * Extracts pen properties from a pointer event.
 */
function extractPenProperties(event: PointerEvent): PenProperties | undefined {
  if (event.pointerType !== "pen") {
    return undefined;
  }

  const extendedEvent = event as ExtendedPointerEvent;

  // Check if eraser by looking at button or pointerType
  // In some browsers, eraser is indicated by button 5
  // Some browsers use pointerType === "eraser"
  const eraserButton = event.button === 5;
  const eraserType = extendedEvent.pointerType === "eraser";
  const actualEraser = eraserButton || eraserType;

  // Barrel buttons: button 2 and 3 are typically barrel buttons
  // Button 5 is eraser, so we don't count it as barrel
  let barrelButton: number | undefined;
  if (event.button === 2) {
    barrelButton = 1;
  } else if (event.button === 3) {
    barrelButton = 2;
  }

  return {
    pressure: event.pressure ?? 0.5,
    tiltX: extendedEvent.tiltX ?? 0,
    tiltY: extendedEvent.tiltY ?? 0,
    twist: extendedEvent.twist,
    isEraser: actualEraser,
    barrelButton,
  };
}

/**
 * Extracts touch points from a touch event.
 */
function extractTouches(event: TouchEvent): TouchPoint[] {
  const touches: TouchPoint[] = [];
  const target = event.target as Element;
  const rect = target?.getBoundingClientRect() ?? { left: 0, top: 0 };

  for (let i = 0; i < event.touches.length; i++) {
    const touch = event.touches[i];
    touches.push({
      identifier: touch.identifier,
      position: {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        clientX: touch.clientX,
        clientY: touch.clientY,
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
        pageX: touch.pageX,
        pageY: touch.pageY,
      },
      radiusX: touch.radiusX,
      radiusY: touch.radiusY,
      rotationAngle: touch.rotationAngle,
      force: touch.force,
    });
  }

  return touches;
}

/**
 * Normalizes a DOM event into a NormalizedInputEvent.
 */
export function normalizeEvent(event: Event, target?: Element): NormalizedInputEvent | null {
  const timestamp = Date.now();
  const baseEvent: Partial<NormalizedInputEvent> = {
    timestamp,
    originalEvent: event,
  };

  // Keyboard events
  if (event instanceof KeyboardEvent) {
    return {
      ...baseEvent,
      type: event.type === "keydown" ? "keydown" : "keyup",
      device: InputDevice.Keyboard,
      position: { x: 0, y: 0, clientX: 0, clientY: 0, offsetX: 0, offsetY: 0, pageX: 0, pageY: 0 },
      buttons: [],
      key: normalizeKey(event.key),
      code: event.code,
      modifiers: extractModifiers(event),
    } as NormalizedInputEvent;
  }

  // Mouse events
  if (event instanceof MouseEvent && !(event instanceof WheelEvent)) {
    const typeMap: Record<string, NormalizedInputEvent["type"]> = {
      mousedown: "mousedown",
      mouseup: "mouseup",
      mousemove: "mousemove",
      mouseleave: "mouseleave",
      contextmenu: "contextmenu",
    };

    return {
      ...baseEvent,
      type: typeMap[event.type] ?? "mousemove",
      device: InputDevice.Mouse,
      position: extractPosition(event, target),
      buttons: extractButtons(event),
      modifiers: extractModifiers(event),
    } as NormalizedInputEvent;
  }

  // Wheel events
  if (event instanceof WheelEvent) {
    return {
      ...baseEvent,
      type: "wheel",
      device: InputDevice.Mouse,
      position: extractPosition(event, target),
      buttons: extractButtons(event),
      modifiers: extractModifiers(event),
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode,
    } as NormalizedInputEvent;
  }

  // Pointer events
  if (event instanceof PointerEvent) {
    const typeMap: Record<string, NormalizedInputEvent["type"]> = {
      pointerdown: "pointerdown",
      pointerup: "pointerup",
      pointermove: "pointermove",
      pointerleave: "pointerleave",
      pointercancel: "pointercancel",
    };

    const deviceMap: Record<string, InputDevice> = {
      mouse: InputDevice.Mouse,
      pen: InputDevice.Pen,
      touch: InputDevice.Touch,
    };

    const extendedEvent = event as ExtendedPointerEvent;
    const pointerType =
      extendedEvent.pointerType === "mouse" ? PointerType.Mouse : extendedEvent.pointerType === "pen" ? PointerType.Pen : extendedEvent.pointerType === "touch" ? PointerType.Touch : undefined;

    return {
      ...baseEvent,
      type: typeMap[event.type] ?? "pointermove",
      device: deviceMap[extendedEvent.pointerType ?? ""] ?? InputDevice.Pointer,
      position: extractPosition(event, target),
      buttons: extractButtons(event),
      modifiers: extractModifiers(event),
      pointerType,
      pen: extractPenProperties(event),
    } as NormalizedInputEvent;
  }

  // Touch events
  if (event instanceof TouchEvent) {
    const typeMap: Record<string, NormalizedInputEvent["type"]> = {
      touchstart: "touchstart",
      touchend: "touchend",
      touchmove: "touchmove",
      touchcancel: "touchcancel",
    };

    // TouchEvent doesn't have modifier properties, so we need to check the original event
    const mouseEvent = event as unknown as MouseEvent;

    return {
      ...baseEvent,
      type: typeMap[event.type] ?? "touchmove",
      device: InputDevice.Touch,
      position: extractPosition(event, target),
      buttons: [],
      modifiers: extractModifiers(mouseEvent),
      touches: extractTouches(event),
    } as NormalizedInputEvent;
  }

  return null;
}

/**
 * Event normalizer class for batch processing.
 */
export class EventNormalizer {
  /**
   * Normalizes a single event.
   */
  normalize(event: Event, target?: Element): NormalizedInputEvent | null {
    return normalizeEvent(event, target);
  }

  /**
   * Normalizes multiple events.
   */
  normalizeBatch(events: Event[], target?: Element): NormalizedInputEvent[] {
    return events.map((e) => normalizeEvent(e, target)).filter((e): e is NormalizedInputEvent => e !== null);
  }
}
