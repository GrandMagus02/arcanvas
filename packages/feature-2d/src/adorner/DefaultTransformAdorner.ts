import type { Camera } from "@arcanvas/core";
import type { RenderObject } from "@arcanvas/graphics";
import { Vector2 } from "@arcanvas/math";
import type { Transform3D } from "@arcanvas/scene";
import type { BoundingBox, DragInfo, ISelectable, ISelectionAdorner } from "@arcanvas/selection";
import { Handle, HandleType } from "@arcanvas/selection";
import { BoundingBox2D } from "../utils/BoundingBox2D";
import { getWorldUnitsPerPixel } from "../utils/getWorldUnitsPerPixel";
import { buildAdornerRenderObjects } from "./adornerMeshes";
import { applyHandleDragToTransform } from "./transformFromHandleDrag";

/**
 * Rotation handle offset in world units.
 * A small value works well when worldUnitsPerPixel is around 0.01 (100 pixels per unit).
 * TODO: Compute this dynamically based on camera zoom for true screen-space sizing.
 */
const ROTATION_OFFSET = 0.3;

/**
 * Element type that has world bounds and transform (e.g. Polygon2DObject, or IElement with getBounds).
 */
export interface IElementWithBoundsAndTransform extends ISelectable {
  transform: Transform3D;
  getBounds(): BoundingBox2D | null;
}

/**
 * Default selection adorner: transform box with corner, edge, and rotation handles.
 * All handles have stable ids for dragHandle routing. Implements getMeshes for WebGL.
 */
export class DefaultTransformAdorner implements ISelectionAdorner<IElementWithBoundsAndTransform, RenderObject> {
  getBounds(el: IElementWithBoundsAndTransform): BoundingBox | null {
    return el.getBounds();
  }

  getHandles(el: IElementWithBoundsAndTransform): Handle[] {
    const bounds = el.getBounds();
    if (!bounds) return [];
    if (!(bounds instanceof BoundingBox2D)) return [];

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

  dragHandle(el: IElementWithBoundsAndTransform, handleId: string, drag: DragInfo): void {
    applyHandleDragToTransform(el, handleId, drag);
  }

  getMeshes(el: IElementWithBoundsAndTransform, context?: unknown): RenderObject[] {
    const bounds = el.getBounds();
    if (!bounds || !(bounds instanceof BoundingBox2D)) return [];
    const handles = this.getHandles(el);
    const camera = (context as { camera?: Camera } | undefined)?.camera;
    const worldUnitsPerPixel = camera !== undefined ? getWorldUnitsPerPixel(camera) : undefined;

    return buildAdornerRenderObjects(bounds, handles, [0.2, 0.5, 1, 1], [1, 1, 1, 1], worldUnitsPerPixel, 10);
  }
}
