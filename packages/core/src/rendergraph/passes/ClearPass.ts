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
    const { gl } = ctx;
    gl.colorMask(true, true, true, true);
    gl.clearColor(this.color[0], this.color[1], this.color[2], this.color[3]);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
}
