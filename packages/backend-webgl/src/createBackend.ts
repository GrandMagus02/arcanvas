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
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;

  if (type === "webgl2") {
    // Try WebGL2 first, fall back to WebGL1 if not available
    gl = target.getContext("webgl2") || target.getContext("webgl");
  } else {
    // Only try WebGL1 when explicitly requested
    gl = target.getContext("webgl");
  }

  if (!gl) {
    throw new Error(`WebGL${type === "webgl2" ? "2" : ""} is not supported in this browser`);
  }

  return new WebGLBackend(gl);
}
