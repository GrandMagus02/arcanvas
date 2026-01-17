import type { NormalizedInputEvent } from "../types/InputEvent";
import { MouseButton } from "../types/MouseButton";

/**
 * Mouse-specific device utilities.
 */
export class MouseDevice {
  /**
   * Checks if a specific mouse button is pressed in an event.
   */
  static isButtonPressed(event: NormalizedInputEvent, button: MouseButton): boolean {
    return event.buttons.includes(button);
  }

  /**
   * Gets all pressed buttons from an event.
   */
  static getPressedButtons(event: NormalizedInputEvent): MouseButton[] {
    return [...event.buttons];
  }

  /**
   * Checks if the left button is pressed.
   */
  static isLeftButtonPressed(event: NormalizedInputEvent): boolean {
    return this.isButtonPressed(event, MouseButton.Left);
  }

  /**
   * Checks if the right button is pressed.
   */
  static isRightButtonPressed(event: NormalizedInputEvent): boolean {
    return this.isButtonPressed(event, MouseButton.Right);
  }

  /**
   * Checks if the middle button is pressed.
   */
  static isMiddleButtonPressed(event: NormalizedInputEvent): boolean {
    return this.isButtonPressed(event, MouseButton.Middle);
  }
}
