import type { MeshBuildResult } from "../../../MeshUtils";
import type { MeshBuilder } from "../../MeshBuilder";
import type { Shape3D } from "../../Shape";

/**
 * Builder that creates an outline from a 3D polygon shape (no triangulation).
 */
export class Polygon3DOutlineBuilder implements MeshBuilder<Shape3D> {
  build(shape: Shape3D): MeshBuildResult {
    // Use vertices directly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const vertices: Float32Array = shape.points;

    // For outline, use empty indices (will use drawArrays)
    return {
      vertices,
      indices: new Uint16Array(0),
    };
  }
}
