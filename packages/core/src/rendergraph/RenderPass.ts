/**
 *
 */
export interface PassContext {
  gl: WebGLRenderingContext;
  width: number;
  height: number;
}

/**
 *
 */
export abstract class RenderPass {
  abstract name(): string;
  abstract execute(ctx: PassContext): void;
}
