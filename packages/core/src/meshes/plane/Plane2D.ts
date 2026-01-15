import { PlaneMesh } from "./PlaneMesh";

/**
 *
 */
export class Plane2D extends PlaneMesh {
  constructor(x: number, y: number, width: number, height: number, z: number = 0) {
    super(new Float32Array([x, y, z, x + width, y, z, x + width, y + height, z, x, y, z, x + width, y + height, z, x, y + height, z]), new Uint16Array([0, 1, 2, 0, 2, 3]));
  }
}
