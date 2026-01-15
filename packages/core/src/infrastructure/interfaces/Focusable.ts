/**
 * Interface for objects that can have focus state.
 */
export interface Focusable {
  /**
   * Checks if the object currently has focus.
   * @returns `true` if the object has focus, `false` otherwise.
   */
  isFocused(): boolean;
}

