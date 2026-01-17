import type { NormalizedInputEvent } from "../types/InputEvent";

/**
 * Touch-specific device utilities.
 */
export class TouchDevice {
  /**
   * Gets all touch points from an event.
   */
  static getTouches(event: NormalizedInputEvent) {
    return event.touches ?? [];
  }

  /**
   * Gets the number of active touches.
   */
  static getTouchCount(event: NormalizedInputEvent): number {
    return event.touches?.length ?? 0;
  }

  /**
   * Gets a specific touch point by identifier.
   */
  static getTouchByIdentifier(event: NormalizedInputEvent, identifier: number) {
    return event.touches?.find((t) => t.identifier === identifier);
  }

  /**
   * Gets the primary (first) touch point.
   */
  static getPrimaryTouch(event: NormalizedInputEvent) {
    return event.touches?.[0];
  }

  /**
   * Checks if the event has multiple touches (multi-touch).
   */
  static isMultiTouch(event: NormalizedInputEvent): boolean {
    return (event.touches?.length ?? 0) > 1;
  }
}
