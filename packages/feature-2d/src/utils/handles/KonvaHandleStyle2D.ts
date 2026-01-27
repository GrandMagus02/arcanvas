import { HandleStyle2D } from "./HandleStyle2D";

/**
 * Konva.js-style handle layout.
 * 8 handles: 4 corners + 4 edges.
 * Plus 1 rotation handle at the top center.
 */
export class KonvaHandleStyle2D extends HandleStyle2D {
  readonly name = "konva";

  protected supportsRotation(): boolean {
    return true;
  }
}
