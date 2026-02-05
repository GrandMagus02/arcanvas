import type { InteractionEvent } from "../../../Interaction";

/**
 * Click event with duration information.
 */
export interface ClickEvent extends InteractionEvent<PointerEvent> {
  /**
   * Duration in milliseconds between pointerdown and pointerup.
   */
  duration: number;
}
