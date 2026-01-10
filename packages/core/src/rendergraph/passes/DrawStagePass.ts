import type { Stage } from "../../Stage";
import { GridMesh } from "../../meshes/grid/Grid";
import { PlaneMesh } from "../../meshes/plane/PlaneMesh";
import { Mesh } from "../../objects/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const camera = ctx.camera;

    // Debug: Log execution
    let meshCount = 0;

    // Compose view-projection matrix if camera is available
    let viewProjection: TransformationMatrix | null = null;
    let cameraPos: [number, number, number] | null = null;

    if (camera) {
      // TypeScript/ESLint may have circular dependency issues with Camera type
      // These are false positives - the types are correct at runtime
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const projection = camera.projection;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const view = camera.view;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      viewProjection = TransformationMatrix.composeViewProjection(projection, view);
      // Get camera position from view matrix's eye
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const eye = view.eye;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const eyeData = eye.data;
      if (eyeData && Array.isArray(eyeData) && eyeData.length >= 3) {
        const x = Number(eyeData[0]);
        const y = Number(eyeData[1]);
        const z = Number(eyeData[2]);
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          cameraPos = [x, y, z];
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    this.stage.traverse((node) => {
      if (node instanceof Mesh) {
        meshCount++;
        // Set view-projection matrix for meshes that support it
        if (viewProjection !== null) {
          if (node instanceof GridMesh) {
            node.setViewProjection(viewProjection);
            node.setViewportSize(ctx.width, ctx.height);
            if (cameraPos !== null) {
              node.setCameraPosition(cameraPos[0], cameraPos[1], cameraPos[2]);
            }
          } else if (node instanceof PlaneMesh) {
            node.setViewProjection(viewProjection);
          } else if ("setViewProjection" in node && typeof (node as { setViewProjection: (m: TransformationMatrix | null) => void }).setViewProjection === "function") {
            (node as { setViewProjection: (m: TransformationMatrix | null) => void }).setViewProjection(viewProjection);
          } else if ("setProjectionMatrix" in node && typeof (node as { setProjectionMatrix: (m: TransformationMatrix | null) => void }).setProjectionMatrix === "function") {
            (node as { setProjectionMatrix: (m: TransformationMatrix | null) => void }).setProjectionMatrix(viewProjection);
          }
        }

        // Render the mesh (program is optional, meshes can use their own)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const program: WebGLProgram | undefined = ctx.program ?? undefined;
        node.render(gl, program);
      }
    });

    // Debug: Log mesh rendering (only on first few frames to avoid spam)
    if (meshCount === 0) {
      console.warn("DrawStagePass: No meshes found in stage");
    }
  }
}
