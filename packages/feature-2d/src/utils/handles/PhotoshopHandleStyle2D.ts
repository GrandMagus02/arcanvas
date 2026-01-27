import { HandleStyle2D } from "./HandleStyle2D";

/**
 * Photoshop-style handle layout.
 * 8 handles: 4 corners + 4 edges.
 * No rotation handle.
 */
export class PhotoshopHandleStyle2D extends HandleStyle2D {
  readonly name = "photoshop";

  protected supportsRotation(): boolean {
    return false;
  }
}
