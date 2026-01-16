/**
 * Utility class for mesh operations.
 */
export class MeshUtils {
  /**
   * Creates a triangle fan from a set of points.
   * Connects the centroid of the points to each pair of adjacent vertices.
   *
   * @param points - The list of points defining the polygon perimeter.
   * @param z - The Z coordinate to use for all vertices (default: 0).
   * @returns A Float32Array containing the vertex data (x, y, z) for the triangles.
   */
  static createTriangleFan(points: { x: number; y: number }[], z: number = 0): Float32Array {
    if (points.length < 3) {
      return new Float32Array(0);
    }

    const vertices: number[] = [];

    // Calculate centroid
    let cx = 0;
    let cy = 0;
    for (const p of points) {
      cx += p.x;
      cy += p.y;
    }
    cx /= points.length;
    cy /= points.length;

    // Generate triangles
    const len = points.length;
    for (let i = 0; i < len; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % len]; // Wrap around

      if (p1 && p2) {
        // Centroid
        vertices.push(cx, cy, z);
        // Point 1
        vertices.push(p1.x, p1.y, z);
        // Point 2
        vertices.push(p2.x, p2.y, z);
      }
    }

    return new Float32Array(vertices);
  }
}
