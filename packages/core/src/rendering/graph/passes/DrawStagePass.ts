import { Mesh } from "../../../scene/Mesh";
import type { Stage } from "../../../scene/Stage";
import { RenderPass, type PassContext } from "../RenderPass";

/**
 * Render pass that draws all meshes in the stage hierarchy.
 */
export class DrawStagePass extends RenderPass {
  constructor(private stage: Stage) {
    super();
  }

  name(): string {
    return "DrawStage";
  }

  execute(ctx: PassContext): void {
    const { renderContext } = ctx;
    this.stage.traverse((node) => {
      if (node instanceof Mesh) {
        node.render(renderContext);
      }
    });
  }
}

