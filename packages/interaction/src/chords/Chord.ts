import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";
import type { ModifierKey } from "../types/ModifierKey";
import type { MouseButton } from "../types/MouseButton";

/**
 * Represents a chord - a simultaneous combination of keys and/or mouse buttons with modifiers.
 */
export class Chord {
  constructor(
    public readonly modifiers: ModifierKey[],
    public readonly keys?: string[],
    public readonly mouseButton?: MouseButton
  ) {}

  /**
   * Checks if this chord matches the given event or state.
   */
  matches(event: NormalizedInputEvent, state?: InputState): boolean {
    // Check modifiers
    const eventModifiers = state ? state.modifiers : event.modifiers;
    for (const modifier of this.modifiers) {
      if (!eventModifiers.includes(modifier)) {
        return false;
      }
    }

    // Check for extra modifiers (strict matching)
    // This can be made configurable if needed
    if (eventModifiers.length !== this.modifiers.length && !state) {
      // If we have state, we might want to allow extra modifiers
      // For now, strict matching
    }

    // Check keys
    if (this.keys && this.keys.length > 0) {
      const eventKey = event.key?.toLowerCase();
      const stateKeys = state ? Array.from(state.keysDown).map((k) => k.toLowerCase()) : [];
      const keysToCheck = state ? stateKeys : eventKey ? [eventKey] : [];

      const hasMatchingKey = this.keys.some((key) => keysToCheck.includes(key.toLowerCase()));
      if (!hasMatchingKey) {
        return false;
      }
    }

    // Check mouse button
    if (this.mouseButton !== undefined) {
      const eventButtons = event.buttons;
      if (!eventButtons.includes(this.mouseButton)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Serializes the chord to a string representation.
   */
  toString(): string {
    const parts: string[] = [];

    // Add modifiers
    parts.push(...this.modifiers.map((m) => m.toString()));

    // Add keys
    if (this.keys && this.keys.length > 0) {
      parts.push(...this.keys);
    }

    // Add mouse button
    if (this.mouseButton !== undefined) {
      const buttonNames: Record<MouseButton, string> = {
        [MouseButton.Left]: "LeftClick",
        [MouseButton.Right]: "RightClick",
        [MouseButton.Middle]: "MiddleClick",
        [MouseButton.Back]: "BackClick",
        [MouseButton.Forward]: "ForwardClick",
      };
      parts.push(buttonNames[this.mouseButton] ?? `Button${this.mouseButton}`);
    }

    return parts.join("+");
  }

  /**
   * Checks if two chords are equal.
   */
  equals(other: Chord): boolean {
    if (this.modifiers.length !== other.modifiers.length) return false;
    if (!this.modifiers.every((m) => other.modifiers.includes(m))) return false;

    if (this.keys?.length !== other.keys?.length) return false;
    if (this.keys && other.keys && !this.keys.every((k) => other.keys!.includes(k))) return false;

    if (this.mouseButton !== other.mouseButton) return false;

    return true;
  }
}
