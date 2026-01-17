import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";

/**
 * Keyboard-specific device utilities.
 */
export class KeyboardDevice {
  /**
   * Checks if a key is pressed in an event.
   */
  static isKeyPressed(event: NormalizedInputEvent, key: string): boolean {
    return event.key?.toLowerCase() === key.toLowerCase();
  }

  /**
   * Checks if a key is currently down in the state.
   */
  static isKeyDown(state: InputState, key: string): boolean {
    return state.isKeyDown(key);
  }

  /**
   * Gets the normalized key from an event.
   */
  static getKey(event: NormalizedInputEvent): string | undefined {
    return event.key;
  }

  /**
   * Gets the physical key code from an event.
   */
  static getCode(event: NormalizedInputEvent): string | undefined {
    return event.code;
  }
}
