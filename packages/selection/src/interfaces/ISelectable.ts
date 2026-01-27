/**
 * Interface for objects that can be selected.
 * Objects implementing this interface can be managed by SelectionManager.
 */
export interface ISelectable {
  /**
   * Unique identifier for the selectable object.
   */
  readonly id: string;

  /**
   * Gets the bounding box of the object in world space.
   * Returns null if the object has no bounds (e.g., invisible or invalid).
   */
  getBounds(): BoundingBox | null;

  /**
   * Checks if the object is currently visible.
   */
  isVisible(): boolean;
}

/**
 * Bounding box interface for dimension-agnostic bounds.
 * Dimension-specific implementations (BoundingBox2D, BoundingBox3D) should extend this.
 */
export interface BoundingBox {
  /**
   * Gets the center point of the bounding box.
   */
  getCenter(): { x: number; y: number; z?: number };

  /**
   * Checks if a point is inside the bounding box.
   */
  contains(point: { x: number; y: number; z?: number }): boolean;
}
