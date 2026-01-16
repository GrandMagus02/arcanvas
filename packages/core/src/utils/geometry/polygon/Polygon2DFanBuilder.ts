import { MeshUtils, type MeshBuildResult } from "./../../MeshUtils";
import type { MeshBuilder } from "./../MeshBuilder";
import type { Shape2D } from "./../Shape";

/**
 * Builder that creates a triangle fan from a 2D polygon shape.
 */
export class Polygon2DFanBuilder implements MeshBuilder<Shape2D> {
  constructor(private z: number = 0) {}

  build(shape: Shape2D): MeshBuildResult {
    // Convert flat 2D points to {x,y}[] format for MeshUtils
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < shape.points.length; i += 2) {
      points.push({
        x: shape.points[i],
        y: shape.points[i + 1],
      });
    }

    return MeshUtils.createTriangleFanIndexed(points, this.z);
  }
}
