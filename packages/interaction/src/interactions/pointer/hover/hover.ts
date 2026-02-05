import type { InteractionEvent } from "../../../Interaction";
import { HoverInteraction } from "./HoverInteraction";

/**
 * Hover interaction.
 */
export function hover(callback: (event: InteractionEvent<PointerEvent>) => void) {
  return new HoverInteraction(callback);
}
