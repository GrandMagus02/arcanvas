import { MeshUtils } from "../../utils/MeshUtils";
import { PointUtils, type PointsArray } from "../../utils/PointUtils";
import { PolygonMesh } from "./PolygonMesh";

/**
 * A 2D Polygon mesh defined by a list of points.
 * Automatically triangulates the polygon using a triangle fan from the centroid.
 */
export class Polygon2D extends PolygonMesh {
  /**
   * Create a new Polygon2D.
   * @param points - Array of points. Can be a flat array [x0, y0, x1, y1, ...] or array of arrays [[x0, y0], [x1, y1], ...].
   *                 If a flat array has odd length, the last value is treated as X and Y defaults to 0.
   * @param z - The Z-coordinate for all points (defaults to 0).
   */
  constructor(points: PointsArray, z: number = 0) {
    // Parse input points using PointUtils
    const parsedPoints = PointUtils.points2DFromArray(points);

    if (parsedPoints.length < 3) {
      // Not enough points to form a polygon
      super(new Float32Array(0), new Uint16Array(0));
      return;
    }

    // Generate triangles using MeshUtils
    const vertices = MeshUtils.createTriangleFan(parsedPoints, z);

    super(vertices, new Uint16Array(vertices.length / 3));
  }
}
