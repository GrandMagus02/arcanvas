import type { Float32Matrix2x2, Float64Matrix2x2, Int16Matrix2x2, Uint16Matrix2x2, Uint8Matrix2x2 } from "./Matrix2x2";
import type { Float32Matrix3x3, Float64Matrix3x3, Int16Matrix3x3, Uint16Matrix3x3, Uint8Matrix3x3 } from "./Matrix3x3";
import type { Float32Matrix4x4, Float64Matrix4x4, Int16Matrix4x4, Uint16Matrix4x4, Uint8Matrix4x4 } from "./Matrix4x4";

/**
 * AnyMatrix is a union of all matrix types.
 */
export type AnyMatrix2x2 = Float32Matrix2x2 | Float64Matrix2x2 | Int16Matrix2x2 | Uint16Matrix2x2 | Uint8Matrix2x2;
/**
 * AnyMatrix3x3 is a union of all 3x3 matrix types.
 */
export type AnyMatrix3x3 = Float32Matrix3x3 | Float64Matrix3x3 | Int16Matrix3x3 | Uint16Matrix3x3 | Uint8Matrix3x3;
/**
 * AnyMatrix4x4 is a union of all 4x4 matrix types.
 */
export type AnyMatrix4x4 = Float32Matrix4x4 | Float64Matrix4x4 | Int16Matrix4x4 | Uint16Matrix4x4 | Uint8Matrix4x4;
