import type { EventMap } from "../infrastructure/events/EventMap";

/**
 * Event map for Arcanvas events.
 * Defines all events that Arcanvas can emit and their argument types.
 *
 * @example
 * ```typescript
 * const app = new Arcanvas(canvas);
 * app.on("resize", (width, height) => {
 *   // TypeScript knows width and height are numbers
 * });
 * app.on("focus", () => {
 *   // No arguments
 * });
 * ```
 */
export interface ArcanvasEvents extends EventMap {
  [key: string]: unknown[];
  /**
   * Emitted when the canvas is resized.
   * @param width - The new width in device pixels.
   * @param height - The new height in device pixels.
   */
  resize: [width: number, height: number];

  /**
   * Emitted when the canvas gains focus.
   */
  focus: [];

  /**
   * Emitted when the canvas loses focus.
   */
  blur: [];
}
