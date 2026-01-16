import type { IRenderBackend } from "./IRenderBackend";
import { Canvas2DBackend } from "./backends/Canvas2DBackend";
import { WebGLBackend } from "./backends/WebGLBackend";
import { WebGPUBackend } from "./backends/WebGPUBackend";

/**
 *
 */
export type BackendType = "webgl" | "canvas2d" | "webgpu";

/**
 *
 */
export function createBackend(target: HTMLCanvasElement | WebGLRenderingContext | CanvasRenderingContext2D, backend: BackendType): IRenderBackend {
  if (backend === "webgl") {
    const gl = target instanceof WebGLRenderingContext ? target : target.getContext("webgl");
    if (!gl) throw new Error("WebGL is not available");
    return new WebGLBackend(gl);
  }
  if (backend === "canvas2d") {
    const ctx = target instanceof CanvasRenderingContext2D ? target : target.getContext("2d");
    if (!ctx) throw new Error("Canvas2D is not available");
    return new Canvas2DBackend(ctx);
  }
  return new WebGPUBackend();
}
