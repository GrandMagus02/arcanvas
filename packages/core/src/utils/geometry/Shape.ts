import { PointUtils, type PointsArray } from "./../PointUtils";

/**
 * Base interface for geometric shapes.
 */
export interface Shape {
  readonly dim: number;
}

/**
 * A 2D shape defined by flat points [x0, y0, x1, y1, ...].
 */
export interface Shape2D extends Shape {
  readonly dim: 2;
  readonly points: Float32Array;
}

/**
 * A 3D shape defined by flat points [x0, y0, z0, x1, y1, z1, ...].
 */
export interface Shape3D extends Shape {
  readonly dim: 3;
  readonly points: Float32Array;
}

/**
 * 2D polygon shape implementation.
 */
export class PolygonShape2D implements Shape2D {
  readonly dim = 2 as const;
  readonly points: Float32Array;

  constructor(src: PointsArray | number[]) {
    this.points = PointUtils.toFlat2D(src);
  }
}

/**
 * 3D polygon shape implementation.
 */
export class PolygonShape3D implements Shape3D {
  readonly dim = 3 as const;
  readonly points: Float32Array;

  constructor(src: number[], zDefault: number = 0) {
    this.points = PointUtils.toFlat3D(src, zDefault);
  }
}
