import type { Float32Vector2, Float64Vector2, Int16Vector2, Int32Vector2, Int8Vector2, Uint16Vector2, Uint8ClampedVector2, Uint8Vector2 } from "./Vector2";
import type { Float32Vector3, Float64Vector3, Int16Vector3, Int32Vector3, Int8Vector3, Uint16Vector3, Uint8ClampedVector3, Uint8Vector3 } from "./Vector3";

/**
 * TypedArray is a union of all typed arrays.
 */
export type TypedArray = Uint8Array | Int8Array | Uint8ClampedArray | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;

/**
 * ArrayOrTypedArray is a union of all array-like and typed array types.
 */
export type NumberArray = number[] | TypedArray;

/**
 * TypedArrayConstructor is a union of all typed array constructors.
 */
export type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Int8ArrayConstructor
  | Uint8ClampedArrayConstructor
  | Uint16ArrayConstructor
  | Int16ArrayConstructor
  | Uint32ArrayConstructor
  | Int32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

/**
 * NumberArrayConstructor is a union of all number array constructors.
 */
export type NumberArrayConstructor = ArrayConstructor | TypedArrayConstructor;

/**
 * AnyVector is a union of all vector types.
 */
export type AnyVector2 = Float32Vector2 | Float64Vector2 | Int16Vector2 | Uint16Vector2 | Uint8Vector2 | Int32Vector2 | Int8Vector2 | Uint8ClampedVector2;

/**
 * AnyVector3 is a union of all 3D vector types.
 */
export type AnyVector3 = Float32Vector3 | Float64Vector3 | Int16Vector3 | Uint16Vector3 | Uint8Vector3 | Int32Vector3 | Int8Vector3 | Uint8ClampedVector3;
