import type { Arcanvas } from "./Arcanvas";
import { Node } from "./objects";

/**
 * Stage is a thin facade over the underlying canvas and contexts, providing
 * a stable surface to access drawing primitives and dimensions.
 */
export class Stage extends Node {
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
   * Cleanup: detach from parent node when stage is removed.
   */
  override remove(): void {
    // Call parent remove to detach from parent node
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
    this.parent = null;
  }
}
