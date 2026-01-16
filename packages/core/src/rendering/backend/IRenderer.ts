import type { DrawHook } from "./types";

/**
 * Abstract interface for renderer implementations.
 * Allows the same application code to work with different rendering backends (WebGL, Canvas2D, WebGPU, etc.).
 */
export interface IRenderer {
  /**
   * Whether the renderer is available and ready to use.
   */
  readonly isAvailable: boolean;

  /**
   * Registers a draw hook that will be called each frame.
   * @param fn The draw function to register.
   * @returns A cleanup function to unregister the hook.
   */
  onDraw(fn: DrawHook): () => void;

  /**
   * Starts the render loop.
   */
  start(): void;

  /**
   * Stops the render loop.
   */
  stop(): void;

  /**
   * Renders a single frame immediately without starting the loop.
   */
  renderOnce(): void;

  /**
   * Sets the clear color for the color buffer.
   * @param r Red component (0-1).
   * @param g Green component (0-1).
   * @param b Blue component (0-1).
   * @param a Alpha component (0-1).
   */
  setClearColor(r: number, g: number, b: number, a: number): void;

  /**
   * Enables or disables depth testing.
   * @param enabled Whether depth testing should be enabled.
   */
  setDepthTest(enabled: boolean): void;

  /**
   * Sets an optional scissor rectangle in pixels.
   * @param x X coordinate of the scissor rectangle.
   * @param y Y coordinate of the scissor rectangle.
   * @param w Width of the scissor rectangle.
   * @param h Height of the scissor rectangle.
   */
  setScissor(x: number, y: number, w: number, h: number): void;

  /**
   * Clears the scissor rectangle, disabling scissor testing.
   */
  clearScissor(): void;
}
