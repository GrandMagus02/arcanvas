import { PlaneMesh } from "./PlaneMesh";

/**
 *
 */
export class Plane extends PlaneMesh {
  constructor(points: number[]) {
    super(new Float32Array(points), new Uint16Array(points.length / 3));
  }
}
