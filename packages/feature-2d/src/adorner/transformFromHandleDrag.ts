import type { Transform3D } from "@arcanvas/scene";
import type { DragInfo } from "@arcanvas/selection";
import type { BoundingBox2D } from "../utils/BoundingBox2D";

/**
 * Get the anchor point (opposite corner/edge) for a given handle.
 * Returns the anchor in normalized coordinates [0,1] relative to bounds.
 */
function getAnchorForHandle(handleId: string): { x: number; y: number } {
  switch (handleId) {
    case "corner-tl":
      return { x: 1, y: 0 }; // bottom-right
    case "corner-tr":
      return { x: 0, y: 0 }; // bottom-left
    case "corner-br":
      return { x: 0, y: 1 }; // top-left
    case "corner-bl":
      return { x: 1, y: 1 }; // top-right
    case "edge-top":
      return { x: 0.5, y: 0 }; // bottom-center
    case "edge-bottom":
      return { x: 0.5, y: 1 }; // top-center
    case "edge-left":
      return { x: 1, y: 0.5 }; // right-center
    case "edge-right":
      return { x: 0, y: 0.5 }; // left-center
    default:
      return { x: 0.5, y: 0.5 }; // center
  }
}

/**
 * Get the handle position in normalized coordinates [0,1] relative to bounds.
 */
function getHandlePosition(handleId: string): { x: number; y: number } {
  switch (handleId) {
    case "corner-tl":
      return { x: 0, y: 1 }; // top-left
    case "corner-tr":
      return { x: 1, y: 1 }; // top-right
    case "corner-br":
      return { x: 1, y: 0 }; // bottom-right
    case "corner-bl":
      return { x: 0, y: 0 }; // bottom-left
    case "edge-top":
      return { x: 0.5, y: 1 }; // top-center
    case "edge-bottom":
      return { x: 0.5, y: 0 }; // bottom-center
    case "edge-left":
      return { x: 0, y: 0.5 }; // left-center
    case "edge-right":
      return { x: 1, y: 0.5 }; // right-center
    default:
      return { x: 0.5, y: 0.5 }; // center
  }
}

/**
 * Check if a handle resizes in X direction.
 */
function handleResizesX(handleId: string): boolean {
  return handleId.startsWith("corner-") || handleId === "edge-left" || handleId === "edge-right";
}

/**
 * Check if a handle resizes in Y direction.
 */
function handleResizesY(handleId: string): boolean {
  return handleId.startsWith("corner-") || handleId === "edge-top" || handleId === "edge-bottom";
}

/**
 * Apply handle drag to element transform: resize (corner/edge) or rotate (rotation handle).
 * For resize operations, this properly composes scale transformations around the anchor point.
 */
export function applyHandleDragToTransform(el: { transform: Transform3D; getBounds(): BoundingBox2D | null }, handleId: string, drag: DragInfo): void {
  const bounds = el.getBounds();
  if (!bounds) return;

  if (handleId === "rotation") {
    const center = bounds.getCenter();
    const prevPosition = {
      x: drag.currentPosition.x - drag.incrementalDelta.x,
      y: drag.currentPosition.y - drag.incrementalDelta.y,
    };
    const startAngle = Math.atan2(prevPosition.y - center.y, prevPosition.x - center.x);
    const endAngle = Math.atan2(drag.currentPosition.y - center.y, drag.currentPosition.x - center.x);
    const angle = endAngle - startAngle;
    const matrix = el.transform.matrix.clone();
    const data = matrix.data;
    const cx = center.x;
    const cy = center.y;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const tx = data[12]!;
    const ty = data[13]!;
    data[12] = cx + c * (tx - cx) - s * (ty - cy);
    data[13] = cy + s * (tx - cx) + c * (ty - cy);
    const m00 = data[0]!;
    const m10 = data[1]!;
    const m01 = data[4]!;
    const m11 = data[5]!;
    data[0] = m00 * c - m10 * s;
    data[1] = m00 * s + m10 * c;
    data[4] = m01 * c - m11 * s;
    data[5] = m01 * s + m11 * c;
    el.transform.matrix = matrix;
    return;
  }

  // Get anchor point in world space
  const anchor = getAnchorForHandle(handleId);
  const handlePos = getHandlePosition(handleId);

  // Calculate anchor point in world coordinates
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const anchorWorldX = bounds.minX + anchor.x * width;
  const anchorWorldY = bounds.minY + anchor.y * height;

  // Calculate handle point in world coordinates (before drag)
  const handleWorldX = bounds.minX + handlePos.x * width;
  const handleWorldY = bounds.minY + handlePos.y * height;

  // Calculate new handle position after drag
  const dx = drag.incrementalDelta.x;
  const dy = drag.incrementalDelta.y;
  const newHandleX = handleWorldX + (handleResizesX(handleId) ? dx : 0);
  const newHandleY = handleWorldY + (handleResizesY(handleId) ? dy : 0);

  // Calculate scale factors
  const distFromAnchorX = handleWorldX - anchorWorldX;
  const distFromAnchorY = handleWorldY - anchorWorldY;
  const newDistFromAnchorX = newHandleX - anchorWorldX;
  const newDistFromAnchorY = newHandleY - anchorWorldY;

  let scaleX = 1;
  let scaleY = 1;

  if (handleResizesX(handleId) && Math.abs(distFromAnchorX) > 1e-6) {
    scaleX = newDistFromAnchorX / distFromAnchorX;
  }
  if (handleResizesY(handleId) && Math.abs(distFromAnchorY) > 1e-6) {
    scaleY = newDistFromAnchorY / distFromAnchorY;
  }

  // Prevent negative scaling (flip) for now
  if (scaleX < 0.01) scaleX = 0.01;
  if (scaleY < 0.01) scaleY = 0.01;

  // Apply scale around anchor point:
  // 1. Translate so anchor is at origin
  // 2. Scale
  // 3. Translate back
  // This is: T(anchor) * S * T(-anchor) * currentMatrix
  // We apply this transformation to the existing matrix

  const matrix = el.transform.matrix.clone();
  const data = matrix.data;

  // Current translation
  const tx = data[12]!;
  const ty = data[13]!;

  // Scale the existing basis vectors
  data[0]! *= scaleX;
  data[1]! *= scaleX;
  data[4]! *= scaleY;
  data[5]! *= scaleY;

  // Adjust translation to keep anchor fixed:
  // newTx = anchor.x + scaleX * (oldTx - anchor.x)
  // newTy = anchor.y + scaleY * (oldTy - anchor.y)
  data[12] = anchorWorldX + scaleX * (tx - anchorWorldX);
  data[13] = anchorWorldY + scaleY * (ty - anchorWorldY);

  el.transform.matrix = matrix;
}
