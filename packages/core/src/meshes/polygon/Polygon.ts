import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../utils/geometry/polygon/PolygonGeometry";
import type { MeshBuildResult } from "../../utils/MeshUtils";
import type { PointsArray } from "../../utils/PointUtils";
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
    const result: MeshBuildResult = PolygonGeometry.build(points, {
      space: PolygonSpace.Auto,
      mode: PolygonBuildMode.Outline,
    });
    super(result.vertices, result.indices);
  }
}
