import { MeshUtils, type MeshBuildResult } from "./../../MeshUtils";
import type { MeshBuilder } from "./../MeshBuilder";
import type { Shape2D } from "./../Shape";

/**
 * Builder that creates a triangle fan from a 2D polygon shape.
 */
export class Polygon2DFanBuilder implements MeshBuilder<Shape2D> {
  constructor(private zIndex: number = 0) {}

  build(shape: Shape2D): MeshBuildResult {
    // Convert flat 2D points to {x,y}[] format for MeshUtils
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < shape.points.length; i += 2) {
      points.push({
        x: shape.points[i] ?? 0,
        y: shape.points[i + 1] ?? 0,
      });
    }

    return MeshUtils.createTriangleFanIndexed(points, this.zIndex);
  }
}
