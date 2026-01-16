import type { MeshBuildResult } from "../../../MeshUtils";
import type { MeshBuilder } from "../../MeshBuilder";
import type { Shape3D } from "../../Shape";

/**
 * Builder that creates an outline from a 3D polygon shape (no triangulation).
 * Creates line indices to draw a closed loop outline.
 */
export class Polygon3DOutlineBuilder implements MeshBuilder<Shape3D> {
  build(shape: Shape3D): MeshBuildResult {
    // Shape3D.points is guaranteed to be Float32Array
    const vertices = (shape as { points: Float32Array }).points;
    const vertexCount = vertices.length / 3;

    // Create line indices for a closed loop: [0,1, 1,2, 2,3, ..., n-1,0]
    const indices = new Uint16Array(vertexCount * 2);
    for (let i = 0; i < vertexCount; i++) {
      indices[i * 2] = i;
      indices[i * 2 + 1] = (i + 1) % vertexCount;
    }

    return {
      vertices,
      indices,
    };
  }
}
