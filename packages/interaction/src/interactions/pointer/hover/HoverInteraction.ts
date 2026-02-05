import { Interaction } from "../../../Interaction";
import type { HoverEvent } from "./types";

/**
 * Hover interaction.
 */
export class HoverInteraction extends Interaction<HoverEvent> {
  public readonly name = "hover";
  protected readonly eventMap = {
    pointerover: (event: Event) => {
      this._callback?.({
        originalEvent: event as PointerEvent,
        target: event.target as HTMLElement,
        type: "hover:start",
      });
    },
    mouseleave: (event: Event) => {
      this._callback?.({
        originalEvent: event as PointerEvent,
        target: event.target as HTMLElement,
        type: "hover:end",
      });
    },
  };
}
