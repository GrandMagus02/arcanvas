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
