import type { IRenderBackend } from "./IRenderBackend";
import { Canvas2DBackend } from "./backends/Canvas2DBackend";
import { WebGLBackend } from "./backends/WebGLBackend";
import { WebGPUBackend } from "./backends/WebGPUBackend";

/**
 * Supported rendering backend types.
 */
export type BackendType = "webgl" | "canvas2d" | "webgpu";

/**
 * Creates a render backend instance based on the specified backend type.
 * @param target - Canvas element or rendering context
 * @param backend - Backend type to create
 * @returns Configured render backend instance
 */
export function createBackend(target: HTMLCanvasElement | WebGLRenderingContext | CanvasRenderingContext2D, backend: BackendType): IRenderBackend {
  if (backend === "webgl") {
    const gl = target instanceof WebGLRenderingContext ? target : (target as HTMLCanvasElement).getContext("webgl");
    if (!gl) throw new Error("WebGL is not available");
    return new WebGLBackend(gl);
  }
  if (backend === "canvas2d") {
    const ctx = target instanceof CanvasRenderingContext2D ? target : (target as HTMLCanvasElement).getContext("2d");
    if (!ctx) throw new Error("Canvas2D is not available");
    return new Canvas2DBackend(ctx);
  }
  return new WebGPUBackend();
}
