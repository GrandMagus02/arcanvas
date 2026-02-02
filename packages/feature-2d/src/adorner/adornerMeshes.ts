import { createPositionLayout, Mesh, RenderObject, UnlitColorMaterial } from "@arcanvas/graphics";
import { Transform3D } from "@arcanvas/scene";
import type { Handle } from "@arcanvas/selection";
import type { BoundingBox2D } from "../utils/BoundingBox2D";

/** Fallback handle size in world units when camera is not provided (no screen-space scaling). */
const HANDLE_WORLD_SIZE_DEFAULT = 0.5;
/** Fallback outline thickness in world units when camera is not provided. */
const OUTLINE_THICKNESS_DEFAULT = 0.02;

/**
 * Build a thick line segment as a quad.
 * Creates two triangles forming a rectangle along the line with specified thickness.
 */
function buildThickLineQuad(x1: number, y1: number, x2: number, y2: number, thickness: number, zIndex: number): { vertices: Float32Array; indices: Uint16Array } {
  // Calculate perpendicular direction
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1e-6) {
    return { vertices: new Float32Array(0), indices: new Uint16Array(0) };
  }

  // Perpendicular unit vector
  const px = (-dy / len) * (thickness / 2);
  const py = (dx / len) * (thickness / 2);

  // Four corners of the quad
  const vertices = new Float32Array([
    x1 + px,
    y1 + py,
    zIndex, // 0: start + perpendicular
    x1 - px,
    y1 - py,
    zIndex, // 1: start - perpendicular
    x2 - px,
    y2 - py,
    zIndex, // 2: end - perpendicular
    x2 + px,
    y2 + py,
    zIndex, // 3: end + perpendicular
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  return { vertices, indices };
}

/**
 * Build a thick outline mesh for a 2D rectangle (selection outline).
 * Renders as quads instead of GL_LINES for consistent screen-space thickness.
 * @param bounds - Bounding box to outline
 * @param thickness - Line thickness in world units
 * @param zIndex - Z coordinate for vertices
 */
export function buildOutlineMesh(bounds: BoundingBox2D, thickness?: number, zIndex: number = 0): Mesh {
  const { minX, minY, maxX, maxY } = bounds;
  const t = thickness ?? OUTLINE_THICKNESS_DEFAULT;

  // Build 4 thick line segments for the rectangle
  const segments = [
    buildThickLineQuad(minX, minY, maxX, minY, t, zIndex), // bottom
    buildThickLineQuad(maxX, minY, maxX, maxY, t, zIndex), // right
    buildThickLineQuad(maxX, maxY, minX, maxY, t, zIndex), // top
    buildThickLineQuad(minX, maxY, minX, minY, t, zIndex), // left
  ];

  // Count total vertices and indices
  let totalVerts = 0;
  let totalIndices = 0;
  for (const seg of segments) {
    totalVerts += seg.vertices.length;
    totalIndices += seg.indices.length;
  }

  const vertices = new Float32Array(totalVerts);
  const indices = new Uint16Array(totalIndices);

  let vertOffset = 0;
  let idxOffset = 0;
  let baseVertex = 0;

  for (const seg of segments) {
    vertices.set(seg.vertices, vertOffset);
    for (let i = 0; i < seg.indices.length; i++) {
      indices[idxOffset + i] = seg.indices[i]! + baseVertex;
    }
    vertOffset += seg.vertices.length;
    idxOffset += seg.indices.length;
    baseVertex += seg.vertices.length / 3; // 3 components per vertex
  }

  return new Mesh(vertices, indices, createPositionLayout(3), "triangles");
}

/**
 * Build a single quad mesh for one handle (small square in world space).
 */
function buildHandleQuadMesh(centerX: number, centerY: number, worldSize: number, zIndex: number = 0): { vertices: Float32Array; indices: Uint16Array } {
  const h = worldSize / 2;
  const vertices = new Float32Array([centerX - h, centerY - h, zIndex, centerX + h, centerY - h, zIndex, centerX + h, centerY + h, zIndex, centerX - h, centerY + h, zIndex]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  return { vertices, indices };
}

/**
 * Build mesh for all handles (one quad per handle).
 * @param handles - Handle positions (world space).
 * @param handleWorldSize - Size of each handle quad in world units. If provided (e.g. from camera), handles render at constant screen size.
 * @param zIndex - Z coordinate for vertices.
 */
export function buildHandlesMesh(handles: Handle[], handleWorldSize?: number, zIndex: number = 0): Mesh {
  if (handles.length === 0) {
    return new Mesh(new Float32Array(0), new Uint16Array(0), createPositionLayout(3), "triangles");
  }
  const vertsPerHandle = 4 * 3;
  const indicesPerHandle = 6;
  const vertices = new Float32Array(handles.length * vertsPerHandle);
  const indices = new Uint16Array(handles.length * indicesPerHandle);
  const worldSize = handleWorldSize ?? HANDLE_WORLD_SIZE_DEFAULT;
  for (let i = 0; i < handles.length; i++) {
    const h = handles[i]!;
    const { vertices: v, indices: ix } = buildHandleQuadMesh(h.position.x, h.position.y, worldSize, zIndex);
    vertices.set(v, i * vertsPerHandle);
    for (let j = 0; j < 6; j++) {
      indices[i * 6 + j] = (ix[j] ?? 0) + i * 4;
    }
  }
  return new Mesh(vertices, indices, createPositionLayout(3), "triangles");
}

/** Outline thickness in screen pixels. */
const OUTLINE_THICKNESS_PX = 2;

/** Handle size in screen pixels. */
const HANDLE_SIZE_PX = 8;

/**
 * Create RenderObjects for selection outline and handles (for WebGL).
 * @param worldUnitsPerPixel - If provided, outline and handles render at constant screen size.
 * @param zIndex - Z coordinate for vertices (default: 10).
 */
export function buildAdornerRenderObjects(
  bounds: BoundingBox2D,
  handles: Handle[],
  outlineColor: [number, number, number, number] = [0.2, 0.5, 1, 1],
  handleColor: [number, number, number, number] = [1, 1, 1, 1],
  worldUnitsPerPixel?: number,
  zIndex: number = 10
): RenderObject[] {
  // Calculate outline thickness and handle size in world units for consistent screen-space appearance
  const outlineThickness = worldUnitsPerPixel !== undefined ? OUTLINE_THICKNESS_PX * worldUnitsPerPixel : undefined;
  const handleWorldSize = worldUnitsPerPixel !== undefined ? HANDLE_SIZE_PX * worldUnitsPerPixel : undefined;

  // Debug logging - remove once issue is fixed
  if (typeof console !== "undefined" && (console as unknown as { _adornerLogged?: boolean })._adornerLogged !== true) {
    console.log("[buildAdornerRenderObjects] worldUnitsPerPixel:", worldUnitsPerPixel);
    console.log("[buildAdornerRenderObjects] outlineThickness:", outlineThickness ?? OUTLINE_THICKNESS_DEFAULT, "(default:", OUTLINE_THICKNESS_DEFAULT, ")");
    console.log("[buildAdornerRenderObjects] handleWorldSize:", handleWorldSize ?? HANDLE_WORLD_SIZE_DEFAULT, "(default:", HANDLE_WORLD_SIZE_DEFAULT, ")");
    console.log("[buildAdornerRenderObjects] bounds:", { minX: bounds.minX, maxX: bounds.maxX, minY: bounds.minY, maxY: bounds.maxY });
    (console as unknown as { _adornerLogged?: boolean })._adornerLogged = true;
  }

  const outlineMesh = buildOutlineMesh(bounds, outlineThickness, zIndex);
  const outlineMat = new UnlitColorMaterial({ baseColor: outlineColor, depthTest: false });
  const outlineRo = new RenderObject(outlineMesh, outlineMat, new Transform3D());

  const handlesMesh = buildHandlesMesh(handles, handleWorldSize, zIndex);
  const handlesMat = new UnlitColorMaterial({ baseColor: handleColor, depthTest: false });
  const handlesRo = new RenderObject(handlesMesh, handlesMat, new Transform3D());

  return [outlineRo, handlesRo];
}
