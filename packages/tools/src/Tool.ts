import type { InputState, NormalizedInputEvent } from "@arcanvas/interaction";

/**
 * Base class for all tools.
 * Tools handle user input and modify the scene.
 */
export abstract class Tool {
  /**
   * Name of the tool (for identification).
   */
  abstract readonly name: string;

  /**
   * Called when the tool is activated.
   */
  abstract activate(): void;

  /**
   * Called when the tool is deactivated.
   */
  abstract deactivate(): void;

  /**
   * Handles an input event.
   * @param event - The normalized input event
   * @param state - Current input state
   */
  abstract handleInput(event: NormalizedInputEvent, state: InputState): void;
}
