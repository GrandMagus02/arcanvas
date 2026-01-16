import { PointUtils, type PointsArray } from "../../utils/PointUtils";
import { PolygonMesh } from "./PolygonMesh";

/**
 * A 3D Polygon mesh defined by a list of points.
 * Points can be provided as a flat array [x0, y0, z0, x1, y1, z1, ...] or as 2D points [x0, y0, x1, y1, ...] with z=0.
 */
export class Polygon extends PolygonMesh {
  /**
   * Create a new Polygon.
   * @param points - Array of points. Can be a flat array of 3D coordinates [x0, y0, z0, x1, y1, z1, ...]
   *                 or 2D coordinates [x0, y0, x1, y1, ...] which will be treated as [x0, y0, 0, x1, y1, 0, ...].
   *                 If a 2D flat array has odd length, the last value is treated as X and Y defaults to 0.
   */
  constructor(points: PointsArray | number[]) {
    let vertices: Float32Array;

    // Check if points are 2D (from PointUtils format) or 3D (flat array)
    if (points.length > 0 && Array.isArray(points[0]) && points[0].length === 2) {
      // Handle 2D points array [[x0, y0], [x1, y1], ...]
      const parsedPoints = PointUtils.points2DFromArray(points as number[][]);
      vertices = new Float32Array(parsedPoints.length * 3);
      for (let i = 0; i < parsedPoints.length; i++) {
        const p = parsedPoints[i];
        if (p) {
          vertices[i * 3] = p.x;
          vertices[i * 3 + 1] = p.y;
          vertices[i * 3 + 2] = 0;
        }
      }
    } else if (points.length > 0 && typeof points[0] === "number") {
      // Handle flat array - check if it's 2D or 3D
      const flat = points as number[];
      if (flat.length % 3 === 0) {
        // Already 3D coordinates
        vertices = new Float32Array(flat);
      } else {
        // 2D coordinates (even or odd length), convert to 3D using PointUtils
        // PointUtils handles odd length by defaulting Y to 0
        const parsedPoints = PointUtils.points2DFromArray(flat);
        vertices = new Float32Array(parsedPoints.length * 3);
        for (let i = 0; i < parsedPoints.length; i++) {
          const p = parsedPoints[i];
          if (p) {
            vertices[i * 3] = p.x;
            vertices[i * 3 + 1] = p.y;
            vertices[i * 3 + 2] = 0;
          }
        }
      }
    } else {
      // Invalid input, use empty array
      vertices = new Float32Array(0);
    }

    super(vertices, new Uint16Array(vertices.length / 3));
  }
}
