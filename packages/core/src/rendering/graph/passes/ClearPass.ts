import { RenderPass, type PassContext } from "../RenderPass";

/**
 *
 */
export class ClearPass extends RenderPass {
  constructor(private color: [number, number, number, number]) {
    super();
  }

  name(): string {
    return "Clear";
  }

  execute(ctx: PassContext): void {
    const { renderContext } = ctx;
    renderContext.colorMask(true, true, true, true);
    renderContext.clearColor(this.color[0], this.color[1], this.color[2], this.color[3]);
    const gl = renderContext.getWebGLContext();
    if (gl) {
      // Use WebGL constants for buffer bits
      const COLOR_BUFFER_BIT = 0x00004000; // gl.COLOR_BUFFER_BIT
      const DEPTH_BUFFER_BIT = 0x00000100; // gl.DEPTH_BUFFER_BIT
      renderContext.clear(COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT);
    }
  }
}

