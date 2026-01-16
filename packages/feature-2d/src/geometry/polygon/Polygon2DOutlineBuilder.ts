import type { MeshBuildResult } from "../../utils/MeshUtils";
import type { MeshBuilder } from "../MeshBuilder";
import type { Shape2D } from "../Shape";

/**
 * Builder that creates an outline from a 2D polygon shape (no triangulation).
 * Returns vertices in 3D space with the specified Z coordinate.
 * Creates line indices to draw a closed loop outline.
 */
export class Polygon2DOutlineBuilder implements MeshBuilder<Shape2D> {
  constructor(private zIndex: number = 0) {}

  build(shape: Shape2D): MeshBuildResult {
    // Convert 2D points to 3D vertices
    const points: Float32Array = shape.points;
    const pointCount = points.length / 2;
    const vertices = new Float32Array(pointCount * 3);
    for (let i = 0; i < pointCount; i++) {
      vertices[i * 3] = points[i * 2] ?? 0;
      vertices[i * 3 + 1] = points[i * 2 + 1] ?? 0;
      vertices[i * 3 + 2] = this.zIndex;
    }

    // Create line indices for a closed loop: [0,1, 1,2, 2,3, ..., n-1,0]
    const indices = new Uint16Array(pointCount * 2);
    for (let i = 0; i < pointCount; i++) {
      indices[i * 2] = i;
      indices[i * 2 + 1] = (i + 1) % pointCount;
    }

    return {
      vertices,
      indices,
    };
  }
}
