import { ClickInteraction } from "./ClickInteraction";
import type { ClickEvent } from "./types";

/**
 * Click interaction using pointerdown and pointerup events.
 */
export function click(callback: (event: ClickEvent) => void) {
  return new ClickInteraction(callback);
}
