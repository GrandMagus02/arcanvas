# Matrix

BaseMatrix is a base class for all matrices.

## Constructors

`public`: Creates a new Matrix.

Parameters:

* `data`: - The data of the matrix.
* `rows`: - The number of rows in the matrix.
* `cols`: - The number of columns in the matrix.


## Static Methods

- [fromArray](#fromarray)
- [fromVector](#fromvector)
- [fromMatrix](#frommatrix)
- [isMatrix](#ismatrix)

### fromArray

Creates a matrix from an array.

| Method | Type |
| ---------- | ---------- |
| `fromArray` | `<TNewArr extends NumberArray, TNewRows extends number, TNewCols extends number>(array: ArrayLike<number>, rows: TNewRows, cols: TNewCols) => Matrix<TNewArr, TNewRows, TNewCols>` |

Parameters:

* `array`: - The array.
* `rows`: - The number of rows.
* `cols`: - The number of columns.


Returns:

The new matrix.

### fromVector

Creates a matrix from a vector.

| Method | Type |
| ---------- | ---------- |
| `fromVector` | `<TVecArr extends NumberArray, TVecSize extends number>(vector: Vector<TVecArr, TVecSize>) => Matrix<TVecArr, TVecSize, 1>` |

Parameters:

* `vector`: - The vector.


Returns:

The new matrix.

### fromMatrix

Creates a matrix from another matrix.

| Method | Type |
| ---------- | ---------- |
| `fromMatrix` | `<TArr extends NumberArray, TRows extends number, TCols extends number, TSelf extends Matrix<TArr, TRows, TCols>>(this: new (data: TArr, rows: TRows, cols: TCols) => TSelf, matrix: Matrix<TArr, TRows, TCols>) => TSelf` |

Parameters:

* `matrix`: - The matrix.


Returns:

The new matrix.

### isMatrix

Check if a value is a Matrix.

| Method | Type |
| ---------- | ---------- |
| `isMatrix` | `(value: unknown) => value is Matrix<NumberArray, number, number>` |

Parameters:

* `value`: - The value to check.


Returns:

True if the value is a Matrix.

## Methods

- [get](#get)
- [set](#set)
- [forEach](#foreach)
- [map](#map)
- [reduce](#reduce)
- [every](#every)
- [some](#some)
- [find](#find)
- [findIndex](#findindex)
- [fill](#fill)
- [mult](#mult)
- [add](#add)
- [sub](#sub)
- [div](#div)
- [dot](#dot)
- [equals](#equals)
- [clone](#clone)
- [transpose](#transpose)
- [toArray](#toarray)
- [toFloat32Array](#tofloat32array)
- [toFloat64Array](#tofloat64array)
- [toInt8Array](#toint8array)
- [toInt16Array](#toint16array)
- [toInt32Array](#toint32array)
- [toUint16Array](#touint16array)
- [toUint8Array](#touint8array)
- [toUint8ClampedArray](#touint8clampedarray)
- [toUint32Array](#touint32array)

### get

Returns the value of the matrix at the given row and column.

| Method | Type |
| ---------- | ---------- |
| `get` | `(r: number, c: number) => number` |

Parameters:

* `r`: - The row.
* `c`: - The column.


Returns:

The value.

### set

Sets the value of the matrix at the given row and column.

| Method | Type |
| ---------- | ---------- |
| `set` | `(r: number, c: number, value: number) => this` |

Parameters:

* `r`: - The row.
* `c`: - The column.
* `value`: - The value to set.


Returns:

The matrix.

### forEach

Iterates over the matrix.

| Method | Type |
| ---------- | ---------- |
| `forEach` | `(callback: (value: number, r: number, c: number) => void) => void` |

Parameters:

* `callback`: - The callback function.


### map

Maps the matrix to a new matrix.

| Method | Type |
| ---------- | ---------- |
| `map` | `(callback: (value: number, r: number, c: number) => number) => Matrix<TArr, TRows, TCols>` |

Parameters:

* `callback`: - The callback function.


Returns:

The mapped matrix.

### reduce

Reduces the matrix to a single value.

| Method | Type |
| ---------- | ---------- |
| `reduce` | `(callback: (accumulator: number, value: number, r: number, c: number) => number, initialValue: number) => number` |

Parameters:

* `callback`: - The callback function.
* `initialValue`: - The initial value.


Returns:

The reduced value.

### every

Returns true if all elements satisfy the callback function.

| Method | Type |
| ---------- | ---------- |
| `every` | `(callback: (value: number, r: number, c: number) => boolean) => boolean` |

Parameters:

* `callback`: - The callback function.


Returns:

True if all elements satisfy the callback function.

### some

Returns true if at least one element satisfies the callback function.

| Method | Type |
| ---------- | ---------- |
| `some` | `(callback: (value: number, r: number, c: number) => boolean) => boolean` |

Parameters:

* `callback`: - The callback function.


Returns:

True if at least one element satisfies the callback function.

### find

Finds the first element that satisfies the callback function.

| Method | Type |
| ---------- | ---------- |
| `find` | `(callback: (value: number, r: number, c: number) => boolean) => number or undefined` |

Parameters:

* `callback`: - The callback function.


Returns:

The first element that satisfies the callback function.

### findIndex

Finds the index of the first element that satisfies the callback function.

| Method | Type |
| ---------- | ---------- |
| `findIndex` | `(callback: (value: number, r: number, c: number) => boolean) => [number, number] or undefined` |

Parameters:

* `callback`: - The callback function.


Returns:

The index of the first element that satisfies the callback function.

### fill

Fills the matrix with the given value.

| Method | Type |
| ---------- | ---------- |
| `fill` | `(value: number) => this` |

Parameters:

* `value`: - The value to fill the matrix with.


Returns:

The matrix.

### mult

Returns a copy of the matrix multiplied by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `mult` | `<TOtherRows extends number, TOtherCols extends number>(other: Matrix<NumberArray, TOtherRows, TOtherCols> or Vector<NumberArray, TOtherCols>) => Matrix<...>` |

Parameters:

* `other`: - The other matrix.


Returns:

The multiplied matrix.

### add

Returns a copy of the matrix added by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `add` | `(other: Matrix<NumberArray, TRows, TCols>) => Matrix<TArr, TRows, TCols>` |

Parameters:

* `other`: - The other matrix.


Returns:

The added matrix.

### sub

Returns a copy of the matrix subtracted by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `sub` | `(other: Matrix<NumberArray, TRows, TCols>) => Matrix<TArr, TRows, TCols>` |

Parameters:

* `other`: - The other matrix.


Returns:

The subtracted matrix.

### div

Returns a copy of the matrix divided by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `div` | `(other: Matrix<NumberArray, TRows, TCols>) => Matrix<TArr, TRows, TCols>` |

Parameters:

* `other`: - The other matrix.


Returns:

The divided matrix.

### dot

Returns the dot product of the matrix and the other matrix.

| Method | Type |
| ---------- | ---------- |
| `dot` | `(other: Matrix<NumberArray, TRows, TCols> or Vector<NumberArray, TCols>) => number` |

Parameters:

* `other`: - The other matrix.


Returns:

The dot product.

### equals

Returns true if the matrix is equal to the other matrix.

| Method | Type |
| ---------- | ---------- |
| `equals` | `(other: Matrix<NumberArray, TRows, TCols> or Vector<NumberArray, TCols>) => boolean` |

Parameters:

* `other`: - The other matrix.


Returns:

True if the matrix is equal to the other matrix.

### clone

Returns a copy of the matrix.

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => Matrix<TArr, TRows, TCols>` |

Returns:

The copy.

### transpose

Transposes the matrix.

| Method | Type |
| ---------- | ---------- |
| `transpose` | `() => Matrix<TArr, TCols, TRows>` |

Returns:

The transposed matrix.

### toArray

Returns a copy of the matrix as an array.

| Method | Type |
| ---------- | ---------- |
| `toArray` | `(orientation?: MatrixOrientation) => number[]` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The array.

### toFloat32Array

Returns a copy of the underlying storage as a float32 array.

| Method | Type |
| ---------- | ---------- |
| `toFloat32Array` | `(orientation?: MatrixOrientation) => Float32Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The float32 array.

### toFloat64Array

Returns a copy of the underlying storage as a float64 array.

| Method | Type |
| ---------- | ---------- |
| `toFloat64Array` | `(orientation?: MatrixOrientation) => Float64Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The float64 array.

### toInt8Array

Returns a copy of the underlying storage as a int8 array.

| Method | Type |
| ---------- | ---------- |
| `toInt8Array` | `(orientation?: MatrixOrientation) => Int8Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The int8 array.

### toInt16Array

Returns a copy of the underlying storage as a int16 array.

| Method | Type |
| ---------- | ---------- |
| `toInt16Array` | `(orientation?: MatrixOrientation) => Int16Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The int16 array.

### toInt32Array

Returns a copy of the underlying storage as a int32 array.

| Method | Type |
| ---------- | ---------- |
| `toInt32Array` | `(orientation?: MatrixOrientation) => Int32Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The int32 array.

### toUint16Array

Returns a copy of the underlying storage as a uint16 array.

| Method | Type |
| ---------- | ---------- |
| `toUint16Array` | `(orientation?: MatrixOrientation) => Uint16Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The uint16 array.

### toUint8Array

Returns a copy of the underlying storage as a uint8 array.

| Method | Type |
| ---------- | ---------- |
| `toUint8Array` | `(orientation?: MatrixOrientation) => Uint8Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The uint8 array.

### toUint8ClampedArray

Returns a copy of the underlying storage as a uint8 clamped array.

| Method | Type |
| ---------- | ---------- |
| `toUint8ClampedArray` | `(orientation?: MatrixOrientation) => Uint8ClampedArray<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The uint8 clamped array.

### toUint32Array

Returns a copy of the underlying storage as a uint32 array.

| Method | Type |
| ---------- | ---------- |
| `toUint32Array` | `(orientation?: MatrixOrientation) => Uint32Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array.


Returns:

The uint32 array.
