import type { MeshBuildResult } from "../../../MeshUtils";
import type { MeshBuilder } from "../../MeshBuilder";
import type { Shape2D } from "../../Shape";

/**
 * Builder that creates an outline from a 2D polygon shape (no triangulation).
 * Returns vertices in 3D space with the specified Z coordinate.
 */
export class Polygon2DOutlineBuilder implements MeshBuilder<Shape2D> {
  constructor(private z: number = 0) {}

  build(shape: Shape2D): MeshBuildResult {
    // Convert 2D points to 3D vertices
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const points: Float32Array = shape.points;
    const pointCount = points.length / 2;
    const vertices = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      vertices[i * 3] = points[i * 2];
      vertices[i * 3 + 1] = points[i * 2 + 1];
      vertices[i * 3 + 2] = this.z;
    }

    // For outline, use empty indices (will use drawArrays)
    return {
      vertices,
      indices: new Uint16Array(0),
    };
  }
}
