import type { IRenderBackend } from "@arcanvas/graphics";
import { WebGLBackend } from "./WebGLBackend";

/**
 * Backend type identifier.
 */
export type BackendType = "webgl" | "webgl2";

/**
 * Creates a render backend for the given canvas.
 */
export function createBackend(target: HTMLCanvasElement, type: BackendType = "webgl"): IRenderBackend {
  // Try to get WebGL2 context first, fall back to WebGL1
  const gl = target.getContext("webgl2") || target.getContext("webgl");
  if (!gl) {
    throw new Error("WebGL is not supported in this browser");
  }

  return new WebGLBackend(gl);
}
