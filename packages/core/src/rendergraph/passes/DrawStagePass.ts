import type { Stage } from "../../Stage";
import { Mesh } from "../../objects/Mesh";
import { RenderPass, type PassContext } from "../RenderPass";

/**
 *
 */
export class DrawStagePass extends RenderPass {
  constructor(private stage: Stage) {
    super();
  }

  name(): string {
    return "DrawStage";
  }

  execute(ctx: PassContext): void {
    const gl = ctx.gl;
    this.stage.traverse((node) => {
      if (node instanceof Mesh) node.render(gl);
    });
  }
}
