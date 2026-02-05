import { Interactive } from "../Interactive";

/**
 * Creates an interactive object from a single or multiple elements.
 */
export function createInteractive(elements: HTMLElement | HTMLElement[]): Interactive {
  return new Interactive(elements);
}
