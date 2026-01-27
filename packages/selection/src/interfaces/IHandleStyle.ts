import type { HandleSet } from "../core/HandleSet";
import type { BoundingBox } from "./ISelectable";

/**
 * Interface for handle styles.
 * Different implementations can provide different handle layouts (Photoshop, Konva, etc.).
 */
export interface IHandleStyle {
  /**
   * Creates a set of handles for a given bounding box.
   * @param bounds - The bounding box to create handles for
   * @returns A HandleSet containing all handles for this style
   */
  createHandles(bounds: BoundingBox): HandleSet;

  /**
   * Gets the name of this handle style (for identification).
   */
  readonly name: string;
}
