import { InputDevice } from "../types/InputDevice";
import type { NormalizedInputEvent } from "../types/InputEvent";
import { PointerType } from "../types/PointerType";

/**
 * Detects the input device type from an event.
 */
export class DeviceDetector {
  /**
   * Detects device type from a normalized event.
   */
  static detect(event: NormalizedInputEvent): InputDevice {
    return event.device;
  }

  /**
   * Checks if an event is from a specific device type.
   */
  static isDevice(event: NormalizedInputEvent, device: InputDevice): boolean {
    return event.device === device;
  }

  /**
   * Checks if an event is from a pointer device (mouse, pen, or touch via pointer events).
   */
  static isPointer(event: NormalizedInputEvent): boolean {
    return event.device === InputDevice.Mouse || event.device === InputDevice.Pen || event.device === InputDevice.Touch || event.device === InputDevice.Pointer;
  }

  /**
   * Checks if an event is from a touch device.
   */
  static isTouch(event: NormalizedInputEvent): boolean {
    return event.device === InputDevice.Touch || (event.device === InputDevice.Pointer && event.pointerType === PointerType.Touch);
  }

  /**
   * Checks if an event is from a pen/stylus device.
   */
  static isPen(event: NormalizedInputEvent): boolean {
    return event.device === InputDevice.Pen || (event.device === InputDevice.Pointer && event.pointerType === PointerType.Pen);
  }
}
