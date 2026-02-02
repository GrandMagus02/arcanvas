import type { Vector2 } from "@arcanvas/math";
import type { IHandleRenderer, RenderContext } from "../interfaces/IHandleRenderer";

/**
 * Types of handles for different interactions.
 */
export enum HandleType {
  /** Corner handle - can resize in both X and Y */
  Corner = "corner",
  /** Edge handle - can resize in one direction */
  Edge = "edge",
  /** Rotation handle - rotates the object */
  Rotation = "rotation",
}

/**
 * Edge positions for edge handles.
 */
export enum EdgePosition {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

/**
 * Corner positions for corner handles.
 */
export enum CornerPosition {
  TopLeft = "top-left",
  TopRight = "top-right",
  BottomLeft = "bottom-left",
  BottomRight = "bottom-right",
}

/**
 * Represents a single interactive handle for selection manipulation.
 */
export class Handle {
  /**
   * Type of handle (corner, edge, or rotation).
   */
  readonly type: HandleType;

  /**
   * Position of the handle in world coordinates.
   */
  position: Vector2;

  /**
   * Size of the handle in pixels (for hit-testing).
   */
  size: number;

  /**
   * CSS cursor style when hovering over this handle.
   */
  cursor: string;

  /**
   * Optional edge position (for edge handles).
   */
  edgePosition?: EdgePosition;

  /**
   * Optional corner position (for corner handles).
   */
  cornerPosition?: CornerPosition;

  /**
   * Identifier for this handle. Required for adorner-driven selection: ISelectionAdorner.dragHandle
   * routes by handleId, so adorners must set id on every handle (e.g. "corner-tl", "edge-top", "rotation").
   */
  id?: string;

  constructor(type: HandleType, position: Vector2, size: number = 8, cursor: string = "default", id?: string) {
    this.type = type;
    this.position = position;
    this.size = size;
    this.cursor = cursor;
    this.id = id;
  }

  /**
   * Checks if a point (in world coordinates) is inside this handle.
   * @param point - Point to test in world coordinates
   * @param worldUnitsPerPixel - Size of a pixel in world units (for accurate hit-testing)
   * @returns True if the point is inside the handle
   */
  contains(point: Vector2, worldUnitsPerPixel: number = 1): boolean {
    const dx = point.x - this.position.x;
    const dy = point.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const handleRadius = (this.size * worldUnitsPerPixel) / 2;
    return distance <= handleRadius;
  }

  /**
   * Renders this handle using the provided renderer.
   * @param renderer - The handle renderer to use
   * @param context - Rendering context
   */
  render(renderer: IHandleRenderer, context: RenderContext): void {
    renderer.renderHandle(this, context);
  }
}
