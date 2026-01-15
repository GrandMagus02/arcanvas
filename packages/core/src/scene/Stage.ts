import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";
import type { IRenderContext } from "../rendering/context";
import { TransformationMatrix } from "../utils/TransformationMatrix";
import { Entity } from "./Entity";
import { Mesh } from "./Mesh";

/**
 * Stage is a thin facade over the underlying canvas and contexts, providing
 * a stable surface to access drawing primitives and dimensions.
 */
export class Stage extends Entity {
  private readonly app: IArcanvasContext;

  constructor(app: IArcanvasContext) {
    super();
    this.app = app;
  }

  /** Returns the backing HTMLCanvasElement. */
  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  /** Current pixel width of the canvas. */
  get width(): number {
    return this.app.canvas.width;
  }

  /** Current pixel height of the canvas. */
  get height(): number {
    return this.app.canvas.height;
  }

  /**
   * Cleanup: detach from parent node when stage is removed.
   */
  override remove(): void {
    // Call parent remove to detach from parent node
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
    this.parent = null;
  }

  draw(renderContext: IRenderContext): void {
    // Get view-projection matrix from active camera
    const camera = this.app.camera;
    let viewProjectionMatrix: TransformationMatrix | null = null;

    if (camera) {
      try {
        viewProjectionMatrix = camera.getViewProjectionMatrix();
        // Debug: log matrix values (only first frame to avoid spam)
        if (!(window as { _loggedMatrix?: boolean })._loggedMatrix) {
          console.log(
            "[Stage] View-Projection Matrix:",
            Array.from(viewProjectionMatrix.data).map((v) => v.toFixed(3))
          );
          console.log("[Stage] Camera position:", camera.position.x, camera.position.y, camera.position.z);
          console.log(
            "[Stage] Camera view matrix:",
            Array.from(camera.view.data).map((v) => v.toFixed(3))
          );
          console.log(
            "[Stage] Camera projection matrix:",
            Array.from(camera.projection.data).map((v) => v.toFixed(3))
          );
          (window as { _loggedMatrix?: boolean })._loggedMatrix = true;
        }
      } catch (error) {
        console.error("[Stage] Error computing view-projection matrix:", error);
      }
    }

    this.traverse((node) => {
      if (node instanceof Mesh) {
        // Set view-projection matrix if mesh supports it
        if (viewProjectionMatrix && "setViewProjection" in node && typeof node.setViewProjection === "function") {
          (node as unknown as { setViewProjection: (matrix: TransformationMatrix | null) => void }).setViewProjection(viewProjectionMatrix);
        }
        node.render(renderContext);
      }
    });
  }
}
