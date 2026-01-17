import type { NormalizedInputEvent } from "../types/InputEvent";

/**
 * Pen button identifiers.
 */
export enum PenButton {
  Tip = 0,
  Eraser = 5,
  Button1 = 2,
  Button2 = 3,
}

/**
 * Pen/stylus-specific device utilities.
 */
export class PenDevice {
  /**
   * Gets pen properties from an event, or null if not a pen event.
   */
  static getPenProperties(event: NormalizedInputEvent) {
    return event.pen ?? null;
  }

  /**
   * Gets pressure from a pen event (0-1).
   */
  static getPressure(event: NormalizedInputEvent): number {
    return event.pen?.pressure ?? 0.5;
  }

  /**
   * Gets tilt X angle from a pen event (in degrees).
   */
  static getTiltX(event: NormalizedInputEvent): number {
    return event.pen?.tiltX ?? 0;
  }

  /**
   * Gets tilt Y angle from a pen event (in degrees).
   */
  static getTiltY(event: NormalizedInputEvent): number {
    return event.pen?.tiltY ?? 0;
  }

  /**
   * Gets twist angle from a pen event (in degrees), if available.
   */
  static getTwist(event: NormalizedInputEvent): number | undefined {
    return event.pen?.twist;
  }

  /**
   * Checks if the eraser end is active.
   */
  static isEraser(event: NormalizedInputEvent): boolean {
    return event.pen?.isEraser ?? false;
  }

  /**
   * Gets the barrel button number if pressed (1 or 2), or undefined.
   */
  static getBarrelButton(event: NormalizedInputEvent): number | undefined {
    return event.pen?.barrelButton;
  }

  /**
   * Checks if a specific barrel button is pressed.
   */
  static isBarrelButtonPressed(event: NormalizedInputEvent, button: 1 | 2): boolean {
    return event.pen?.barrelButton === button;
  }

  /**
   * Maps button number to PenButton enum.
   */
  static getPenButton(button: number): PenButton | null {
    if (button === 0) return PenButton.Tip;
    if (button === 5) return PenButton.Eraser;
    if (button === 2) return PenButton.Button1;
    if (button === 3) return PenButton.Button2;
    return null;
  }
}
