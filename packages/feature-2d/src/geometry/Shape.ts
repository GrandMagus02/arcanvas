import type { Shape } from "@arcanvas/core";
import { PointUtils, type PointsArray } from "../utils/PointUtils";

/**
 * A 2D shape defined by flat points [x0, y0, x1, y1, ...].
 */
export abstract class Shape2D implements Shape {
  readonly dim = 2 as const;
  abstract readonly points: Float32Array;
}

/**
 * 2D polygon shape implementation.
 */
export class PolygonShape2D extends Shape2D {
  readonly points: Float32Array;

  constructor(src: PointsArray | number[]) {
    super();
    this.points = PointUtils.toFlat2D(src);
  }
}

/**
 * A 3D shape defined by flat points [x0, y0, z0, x1, y1, z1, ...].
 */
export abstract class Shape3D implements Shape {
  readonly dim = 3 as const;
  abstract readonly points: Float32Array;
}

/**
 * 3D polygon shape implementation.
 */
export class PolygonShape3D extends Shape3D {
  readonly points: Float32Array;

  constructor(src: number[] | Float32Array, zIndex: number = 0) {
    super();
    this.points = src instanceof Float32Array ? src : new Float32Array(src);
    void zIndex; // reserved for future use (e.g. draw order)
  }
}
