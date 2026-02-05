import { Interaction } from "../../../Interaction";
import type { ClickEvent } from "./types";

/**
 * Click interaction using pointerdown and pointerup events.
 */
export class ClickInteraction extends Interaction<ClickEvent> {
  public readonly name = "click";
  private __pointerDownTimes: WeakMap<HTMLElement, number> = new WeakMap();

  protected readonly eventMap = {
    pointerdown: (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const element = event.currentTarget as HTMLElement;
      // Only track primary button (left mouse button)
      if (pointerEvent.button === 0) {
        this.__pointerDownTimes.set(element, Date.now());
      }
    },
    pointerup: (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const element = event.currentTarget as HTMLElement;
      // Only process if it's the primary button and we have a corresponding pointerdown
      if (pointerEvent.button === 0 && this.__pointerDownTimes.has(element)) {
        const downTime = this.__pointerDownTimes.get(element)!;
        const upTime = Date.now();
        const duration = upTime - downTime;

        this._callback?.({
          originalEvent: pointerEvent,
          target: element,
          type: "click",
          duration,
        });

        // Clean up the pointerdown time
        this.__pointerDownTimes.delete(element);
      }
    },
    pointercancel: (event: Event) => {
      const pointerEvent = event as PointerEvent;
      const element = event.currentTarget as HTMLElement;
      // Clean up pointerdown time if interaction is cancelled
      if (pointerEvent.button === 0 && this.__pointerDownTimes.has(element)) {
        this.__pointerDownTimes.delete(element);
      }
    },
  };
}
