import type { NumberArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector2 is a 2D vector of 32-bit floating point numbers.
 */
export class Vector2<T extends NumberArray = Float32Array> extends Vector<T, 2> {}

/**
 * Vector3 is a 3D vector of 32-bit floating point numbers.
 */
export class Vector3<T extends NumberArray = Float32Array> extends Vector<T, 3> {}

/**
 * Vector4 is a 4D vector of 32-bit floating point numbers.
 */
export class Vector4<T extends NumberArray = Float32Array> extends Vector<T, 4> {}
