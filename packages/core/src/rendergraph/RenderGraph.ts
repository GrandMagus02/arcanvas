import type { PassContext, RenderPass } from "./RenderPass";

/**
 *
 */
export class RenderGraph {
  private passes: RenderPass[] = [];

  addPass(pass: RenderPass): this {
    this.passes.push(pass);
    return this;
  }

  clear(): void {
    this.passes.length = 0;
  }

  execute(ctx: PassContext): void {
    for (const p of this.passes) {
      const passName = p.name();
      p.execute(ctx);
      
      // Check for WebGL errors after each pass
      const error = ctx.gl.getError();
      if (error !== ctx.gl.NO_ERROR) {
        const errorNames: Record<number, string> = {
          0x0500: "INVALID_ENUM",
          0x0501: "INVALID_VALUE",
          0x0502: "INVALID_OPERATION",
          0x0503: "INVALID_FRAMEBUFFER_OPERATION",
          0x0505: "OUT_OF_MEMORY",
        };
        console.error(`RenderGraph: WebGL error after ${passName} pass:`, errorNames[error] || `0x${error.toString(16)}`);
      }
    }
  }
}
