import type { Camera } from "@arcanvas/core";
import type { RenderObject } from "@arcanvas/graphics";
import { Vector2 } from "@arcanvas/math";
import type { BoundingBox, DragInfo, ISelectionAdorner } from "@arcanvas/selection";
import { Handle, HandleType } from "@arcanvas/selection";
import { BoundingBox2D } from "../utils/BoundingBox2D";
import { getWorldUnitsPerPixel } from "../utils/getWorldUnitsPerPixel";
import { buildAdornerRenderObjects } from "./adornerMeshes";
import type { IElementWithBoundsAndTransform } from "./DefaultTransformAdorner";

/**
 * Rotation handle offset in world units.
 * A small value works well when worldUnitsPerPixel is around 0.01 (100 pixels per unit).
 */
const ROTATION_OFFSET = 0.3;

/**
 * Group adorner for multiple selected elements.
 * Single bounding box around all elements; transform handles apply to the group
 * (translate all, or scale/rotate around group pivot and distribute to children).
 */
export class GroupAdorner implements ISelectionAdorner<IElementWithBoundsAndTransform[], RenderObject> {
  getBounds(elements: IElementWithBoundsAndTransform[]): BoundingBox | null {
    if (elements.length === 0) return null;
    let union: BoundingBox2D | null = null;
    for (const el of elements) {
      const b = el.getBounds();
      if (!b || !(b instanceof BoundingBox2D)) continue;
      union = union ? union.union(b) : b;
    }
    return union;
  }

  getHandles(elements: IElementWithBoundsAndTransform[]): Handle[] {
    const bounds = this.getBounds(elements);
    if (!bounds || !(bounds instanceof BoundingBox2D)) return [];

    const corners = bounds.getCorners();
    const center = bounds.getCenter();
    const handles: Handle[] = [];

    // Use a large hit-test size for handles to make them easier to grab
    const HIT_SIZE = 20;

    handles.push(new Handle(HandleType.Corner, Vector2.of(corners[3]!.x, corners[3]!.y), HIT_SIZE, "nwse-resize", "corner-tl"));
    handles.push(new Handle(HandleType.Corner, Vector2.of(corners[2]!.x, corners[2]!.y), HIT_SIZE, "nesw-resize", "corner-tr"));
    handles.push(new Handle(HandleType.Corner, Vector2.of(corners[1]!.x, corners[1]!.y), HIT_SIZE, "nwse-resize", "corner-br"));
    handles.push(new Handle(HandleType.Corner, Vector2.of(corners[0]!.x, corners[0]!.y), HIT_SIZE, "nesw-resize", "corner-bl"));

    handles.push(new Handle(HandleType.Edge, Vector2.of(center.x, bounds.maxY), HIT_SIZE, "ns-resize", "edge-top"));
    handles.push(new Handle(HandleType.Edge, Vector2.of(center.x, bounds.minY), HIT_SIZE, "ns-resize", "edge-bottom"));
    handles.push(new Handle(HandleType.Edge, Vector2.of(bounds.minX, center.y), HIT_SIZE, "ew-resize", "edge-left"));
    handles.push(new Handle(HandleType.Edge, Vector2.of(bounds.maxX, center.y), HIT_SIZE, "ew-resize", "edge-right"));

    const rotationY = bounds.maxY + ROTATION_OFFSET;
    handles.push(new Handle(HandleType.Rotation, Vector2.of(center.x, rotationY), HIT_SIZE, "grab", "rotation"));

    return handles;
  }

  dragHandle(elements: IElementWithBoundsAndTransform[], handleId: string, drag: DragInfo): void {
    if (handleId === "rotation") {
      const bounds = this.getBounds(elements);
      if (!bounds || !(bounds instanceof BoundingBox2D)) return;
      const center = bounds.getCenter();
      const prevPosition = {
        x: drag.currentPosition.x - drag.incrementalDelta.x,
        y: drag.currentPosition.y - drag.incrementalDelta.y,
      };
      const startAngle = Math.atan2(prevPosition.y - center.y, prevPosition.x - center.x);
      const endAngle = Math.atan2(drag.currentPosition.y - center.y, drag.currentPosition.x - center.x);
      const angle = endAngle - startAngle;
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      for (const el of elements) {
        const m = el.transform.matrix.clone();
        const d = m.data;
        const tx = d[12]!;
        const ty = d[13]!;
        d[12] = center.x + c * (tx - center.x) - s * (ty - center.y);
        d[13] = center.y + s * (tx - center.x) + c * (ty - center.y);
        const m00 = d[0]!;
        const m10 = d[1]!;
        const m01 = d[4]!;
        const m11 = d[5]!;
        d[0] = m00 * c - m10 * s;
        d[1] = m00 * s + m10 * c;
        d[4] = m01 * c - m11 * s;
        d[5] = m01 * s + m11 * c;
        el.transform.matrix = m;
      }
      return;
    }

    // For groups, resize handles are not yet implemented - they just move the group.
    // A proper implementation would scale each element around the group pivot.
    // For now, translate all elements together.
    const dx = drag.incrementalDelta.x;
    const dy = drag.incrementalDelta.y;
    for (const el of elements) {
      el.transform.matrix.translate(dx, dy, 0);
    }
  }

  getMeshes(elements: IElementWithBoundsAndTransform[], context?: unknown): RenderObject[] {
    const bounds = this.getBounds(elements);
    if (!bounds || !(bounds instanceof BoundingBox2D)) return [];
    const handles = this.getHandles(elements);
    const camera = (context as { camera?: Camera } | undefined)?.camera;
    const worldUnitsPerPixel = camera !== undefined ? getWorldUnitsPerPixel(camera) : undefined;
    return buildAdornerRenderObjects(bounds, handles, [0.2, 0.5, 1, 1], [1, 1, 1, 1], worldUnitsPerPixel, 10);
  }
}
