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
    for (const p of this.passes) p.execute(ctx);
  }
}

