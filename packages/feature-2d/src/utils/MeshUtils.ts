/**
 * Result of mesh building operations containing vertices and indices.
 */
export interface MeshBuildResult {
  vertices: Float32Array;
  indices: Uint16Array;
}

/**
 * Utility class for mesh operations.
 */
export class MeshUtils {
  /**
   * Creates a triangle fan from a set of points.
   * Connects the centroid of the points to each pair of adjacent vertices.
   * Returns unique vertices and indices for efficient indexed rendering.
   *
   * @param points - The list of points defining the polygon perimeter.
   * @param z - The Z coordinate to use for all vertices (default: 0).
   * @returns A Float32Array containing the vertex data (x, y, z) for the triangles.
   * @deprecated Use createTriangleFanIndexed for indexed rendering
   */
  static createTriangleFan(points: { x: number; y: number }[], z: number = 0): Float32Array {
    const result = MeshUtils.createTriangleFanIndexed(points, z);
    // Expand indices to vertices for backward compatibility
    const expanded: number[] = [];
    for (let i = 0; i < result.indices.length; i += 3) {
      const i0 = result.indices[i] ?? 0;
      const i1 = result.indices[i + 1] ?? 0;
      const i2 = result.indices[i + 2] ?? 0;
      expanded.push(
        result.vertices[i0 * 3] ?? 0,
        result.vertices[i0 * 3 + 1] ?? 0,
        result.vertices[i0 * 3 + 2] ?? 0,
        result.vertices[i1 * 3] ?? 0,
        result.vertices[i1 * 3 + 1] ?? 0,
        result.vertices[i1 * 3 + 2] ?? 0,
        result.vertices[i2 * 3] ?? 0,
        result.vertices[i2 * 3 + 1] ?? 0,
        result.vertices[i2 * 3 + 2] ?? 0
      );
    }
    return new Float32Array(expanded);
  }

  /**
   * Creates an indexed triangle fan from a set of points.
   * Connects the centroid of the points to each pair of adjacent vertices.
   * Returns unique vertices and indices for efficient indexed rendering.
   *
   * @param points - The list of points defining the polygon perimeter.
   * @param z - The Z coordinate to use for all vertices (default: 0).
   * @returns An object containing unique vertices and triangle fan indices.
   */
  static createTriangleFanIndexed(points: { x: number; y: number }[], z: number = 0): MeshBuildResult {
    if (points.length < 3) {
      return { vertices: new Float32Array(0), indices: new Uint16Array(0) };
    }

    // Calculate centroid
    let cx = 0;
    let cy = 0;
    for (const p of points) {
      cx += p.x;
      cy += p.y;
    }
    cx /= points.length;
    cy /= points.length;

    // Create unique vertices: [centroid, p0, p1, ..., pN-1]
    const vertices: number[] = [];
    vertices.push(cx, cy, z); // Centroid at index 0
    for (const p of points) {
      vertices.push(p.x, p.y, z);
    }

    // Generate triangle fan indices: [0,1,2, 0,2,3, 0,3,4, ...]
    const indices: number[] = [];
    const len = points.length;
    for (let i = 0; i < len; i++) {
      const next = (i + 1) % len;
      indices.push(0, i + 1, next + 1); // Centroid (0), current point, next point
    }

    return {
      vertices: new Float32Array(vertices),
      indices: new Uint16Array(indices),
    };
  }
}
