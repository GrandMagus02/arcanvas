import type { Camera } from "../camera/Camera";

/**
 *
 */
export interface PassContext {
  gl: WebGLRenderingContext;
  width: number;
  height: number;
  camera: Camera | null;
  program: WebGLProgram | null;
}

/**
 *
 */
export abstract class RenderPass {
  abstract name(): string;
  abstract execute(ctx: PassContext): void;
}
