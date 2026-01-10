import type { Arcanvas } from "./Arcanvas";
import { Mesh, Entity } from "./objects";

/**
 * Stage is a thin facade over the underlying canvas and contexts, providing
 * a stable surface to access drawing primitives and dimensions.
 */
export class Stage extends Entity {
  private readonly app: Arcanvas;

  constructor(app: Arcanvas) {
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
   * Cleanup: detach from parent entity when stage is removed.
   */
  override remove(): void {
    // Call parent remove to detach from parent entity
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
    this.parent = null;
  }

  draw(gl: WebGLRenderingContext, program: WebGLProgram): void {
    this.traverse((entity) => {
      if (entity instanceof Mesh) {
        entity.render(gl, program);
      }
    });
  }
}
