import type { IRenderContext } from "./IRenderContext";

/**
 * Interface for objects that can be rendered using a render context.
 *
 * This interface defines the contract for any object that can be drawn
 * to a rendering surface (WebGL, WebGPU, Canvas2D, etc.).
 */
export interface Renderable {
  /**
   * Renders this object using the provided render context.
   *
   * @param ctx The render context to use for rendering.
   */
  render(ctx: IRenderContext): void;
}
