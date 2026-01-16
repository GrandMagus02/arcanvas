import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../utils/geometry/polygon/PolygonGeometry";
import type { MeshBuildResult } from "../../utils/MeshUtils";
import type { PointsArray } from "../../utils/PointUtils";
import { PolygonMesh } from "./PolygonMesh";

/**
 * Options for creating a Polygon2D.
 */
export interface Polygon2DOptions {
  /**
   * The Z-index of the polygon.
   */
  zIndex?: number;
}

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
  constructor(points: PointsArray, options?: Polygon2DOptions) {
    const result: MeshBuildResult = PolygonGeometry.build(points, {
      space: PolygonSpace.Space2D,
      mode: PolygonBuildMode.FillFan,
      zIndex: options?.zIndex ?? 0,
    });
    super(result.vertices, result.indices);
  }
}
