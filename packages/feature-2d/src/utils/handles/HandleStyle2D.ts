import { Vector2 } from "@arcanvas/math";
import type { BoundingBox, IHandleStyle } from "@arcanvas/selection";
import { Handle, HandleSet, HandleType } from "@arcanvas/selection";
import { BoundingBox2D } from "../BoundingBox2D";

/**
 * Base class for 2D handle styles.
 * Provides common functionality for creating handles from bounding boxes.
 */
export abstract class HandleStyle2D implements IHandleStyle {
  /**
   * Size of handles in pixels.
   */
  handleSize: number = 8;

  /**
   * Distance from bounding box edge for edge handles (in world units).
   */
  edgeHandleOffset: number = 0;

  /**
   * Distance above bounding box for rotation handle (in world units).
   */
  rotationHandleOffset: number = 20;

  abstract readonly name: string;

  /**
   * Creates a set of handles for a given bounding box.
   */
  createHandles(bounds: BoundingBox): HandleSet {
    if (!(bounds instanceof BoundingBox2D)) {
      return new HandleSet();
    }

    const handleSet = new HandleSet();

    // Create corner handles
    this.createCornerHandles(bounds, handleSet);

    // Create edge handles
    this.createEdgeHandles(bounds, handleSet);

    // Create rotation handle (if supported by this style)
    if (this.supportsRotation()) {
      this.createRotationHandle(bounds, handleSet);
    }

    return handleSet;
  }

  /**
   * Creates corner handles for the bounding box.
   */
  protected createCornerHandles(bounds: BoundingBox2D, handleSet: HandleSet): void {
    const corners = bounds.getCorners();

    // Top-left
    handleSet.add(
      new Handle(HandleType.Corner, Vector2.of(corners[3]!.x, corners[3]!.y), this.handleSize, "nwse-resize")
    );

    // Top-right
    handleSet.add(
      new Handle(HandleType.Corner, Vector2.of(corners[2]!.x, corners[2]!.y), this.handleSize, "nesw-resize")
    );

    // Bottom-right
    handleSet.add(
      new Handle(HandleType.Corner, Vector2.of(corners[1]!.x, corners[1]!.y), this.handleSize, "nwse-resize")
    );

    // Bottom-left
    handleSet.add(
      new Handle(HandleType.Corner, Vector2.of(corners[0]!.x, corners[0]!.y), this.handleSize, "nesw-resize")
    );
  }

  /**
   * Creates edge handles for the bounding box.
   */
  protected createEdgeHandles(bounds: BoundingBox2D, handleSet: HandleSet): void {
    const center = bounds.getCenter();
    const width = bounds.getWidth();
    const height = bounds.getHeight();

    // Top edge
    handleSet.add(
      new Handle(HandleType.Edge, Vector2.of(center.x, bounds.maxY), this.handleSize, "ns-resize")
    );

    // Bottom edge
    handleSet.add(
      new Handle(HandleType.Edge, Vector2.of(center.x, bounds.minY), this.handleSize, "ns-resize")
    );

    // Left edge
    handleSet.add(
      new Handle(HandleType.Edge, Vector2.of(bounds.minX, center.y), this.handleSize, "ew-resize")
    );

    // Right edge
    handleSet.add(
      new Handle(HandleType.Edge, Vector2.of(bounds.maxX, center.y), this.handleSize, "ew-resize")
    );
  }

  /**
   * Creates rotation handle (if supported).
   */
  protected createRotationHandle(bounds: BoundingBox2D, handleSet: HandleSet): void {
    const center = bounds.getCenter();
    const rotationY = bounds.maxY + this.rotationHandleOffset;

    handleSet.add(
      new Handle(HandleType.Rotation, Vector2.of(center.x, rotationY), this.handleSize, "grab")
    );
  }

  /**
   * Checks if this style supports rotation handles.
   */
  protected abstract supportsRotation(): boolean;
}
