import { Mesh } from "@arcanvas/graphics";
import { createPositionNormalUVLayout } from "@arcanvas/graphics";

/**
 * Creates a full-screen quad mesh for layer rendering.
 * The quad covers the entire document size with UV coordinates from 0,0 to 1,1.
 *
 * @param width Document width.
 * @param height Document height.
 * @returns A mesh representing a full-screen quad.
 */
export function createQuadMesh(width: number, height: number): Mesh {
  // Create a quad with position (x, y, z) and UV (u, v) coordinates
  // Vertices: 4 corners of the quad
  // Position: (0, 0, 0) to (width, height, 0)
  // UV: (0, 0) to (1, 1)
  const vertices = new Float32Array([
    // Bottom-left: position (x, y, z), normal (0, 0, 1), uv (u, v)
    0, 0, 0, 0, 0, 1, 0, 0,
    // Bottom-right
    width, 0, 0, 0, 0, 1, 1, 0,
    // Top-right
    width, height, 0, 0, 0, 1, 1, 1,
    // Top-left
    0, height, 0, 0, 0, 1, 0, 1,
  ]);

  // Indices for two triangles forming the quad
  const indices = new Uint16Array([
    0, 1, 2, // First triangle
    0, 2, 3, // Second triangle
  ]);

  const layout = createPositionNormalUVLayout();

  return new Mesh(vertices, indices, layout, "triangles");
}
