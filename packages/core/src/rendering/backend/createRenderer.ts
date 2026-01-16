import type { IRenderer } from "./IRenderer";
import type { RendererOptions } from "./types";
import { WebGLRenderer } from "./WebGLRenderer";

/**
 * Supported rendering backends.
 */
export type Backend = "webgl" | "canvas2d" | "webgpu";

/**
 * Creates a renderer instance for the specified backend.
 *
 * @param canvas The canvas element to render to.
 * @param backend The rendering backend to use.
 * @param options Optional renderer configuration options.
 * @returns A renderer instance implementing IRenderer.
 * @throws Error if the backend is not supported or not available.
 *
 * @example
 * ```ts
 * const renderer = createRenderer(canvas, "webgl");
 * renderer.onDraw((ctx) => {
 *   mesh.render(ctx);
 * });
 * renderer.start();
 * ```
 */
export function createRenderer(canvas: HTMLCanvasElement, backend: Backend, options: Partial<RendererOptions> = {}): IRenderer {
  switch (backend) {
    case "webgl":
      return new WebGLRenderer(canvas, options);
    case "canvas2d":
      throw new Error("Canvas2D backend not yet implemented");
    case "webgpu":
      throw new Error("WebGPU backend not yet implemented");
    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = backend;
      throw new Error(`Unknown backend: ${String(_exhaustive)}`);
    }
  }
}
