import type { NumberArray } from "@arcanvas/vector";
import { Matrix } from "./Matrix";

/**
 * Mat2 is a 2x2 matrix of 32-bit floating point numbers.
 */
export class Matrix2<T extends NumberArray = Float32Array> extends Matrix<T, 2> {}

/**
 * Mat3 is a 3x3 matrix of 32-bit floating point numbers.
 */
export class Matrix3<T extends NumberArray = Float32Array> extends Matrix<T, 3> {}

/**
 * Mat4 is a 4x4 matrix of 32-bit floating point numbers.
 */
export class Matrix4<T extends NumberArray = Float32Array> extends Matrix<T, 4> {}
