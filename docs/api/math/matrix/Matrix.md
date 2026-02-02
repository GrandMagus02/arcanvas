# Matrix

BaseMatrix is a base class for all matrices.
Data is stored in **column-major** order for WebGL compatibility.

## Constructors

`public`: Creates a new Matrix.

Parameters:

* `data`: - The data of the matrix (column-major order).
* `cols`: - The number of columns in the matrix.
* `rows`: - The number of rows in the matrix.


## Static Methods

- [fromVector](#fromvector)
- [isMatrix](#ismatrix)

### fromVector

Creates a matrix from a vector.

| Method | Type |
| ---------- | ---------- |
| `fromVector` | `<TVecArr extends NumberArray, TVecSize extends number>(vector: Vector<TVecArr, TVecSize>) => Matrix<TVecArr, TVecSize, 1>` |

Parameters:

* `vector`: - The vector.


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
- [mult](#mult)
- [mult](#mult)
- [add](#add)
- [sub](#sub)
- [div](#div)
- [addSelf](#addself)
- [subSelf](#subself)
- [scaleSelf](#scaleself)
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
| `get` | `(c: number, r?: number, defaultValue?: number) => number` |

Parameters:

* `r`: - The row.
* `c`: - The column.


Returns:

The value.

### set

Sets the value of the matrix at the given row and column.

| Method | Type |
| ---------- | ---------- |
| `set` | `(c: number, r: number, value: number) => this` |

Parameters:

* `c`: - The column.
* `r`: - The row.
* `value`: - The value to set.


Returns:

The matrix.

### forEach

Iterates over the matrix (logically row by row).

| Method | Type |
| ---------- | ---------- |
| `forEach` | `(callback: (value: number, c: number, r: number) => void) => void` |

Parameters:

* `callback`: - The callback function.


### map

Maps the matrix to a new matrix.

| Method | Type |
| ---------- | ---------- |
| `map` | `(callback: (value: number, c: number, r: number) => number) => this` |

Parameters:

* `callback`: - The callback function.


Returns:

The mapped matrix.

### reduce

Reduces the matrix to a single value.

| Method | Type |
| ---------- | ---------- |
| `reduce` | `(callback: (accumulator: number, value: number, c: number, r: number) => number, initialValue: number) => number` |

Parameters:

* `callback`: - The callback function.
* `initialValue`: - The initial value.


Returns:

The reduced value.

### every

Returns true if all elements satisfy the callback function.

| Method | Type |
| ---------- | ---------- |
| `every` | `(callback: (value: number, c: number, r: number) => boolean) => boolean` |

Parameters:

* `callback`: - The callback function.


Returns:

True if all elements satisfy the callback function.

### some

Returns true if at least one element satisfies the callback function.

| Method | Type |
| ---------- | ---------- |
| `some` | `(callback: (value: number, c: number, r: number) => boolean) => boolean` |

Parameters:

* `callback`: - The callback function.


Returns:

True if at least one element satisfies the callback function.

### find

Finds the first element that satisfies the callback function.

| Method | Type |
| ---------- | ---------- |
| `find` | `(callback: (value: number, c: number, r: number) => boolean) => number or undefined` |

Parameters:

* `callback`: - The callback function.


Returns:

The first element that satisfies the callback function.

### findIndex

Finds the index of the first element that satisfies the callback function.

| Method | Type |
| ---------- | ---------- |
| `findIndex` | `(callback: (value: number, c: number, r: number) => boolean) => [number, number] or undefined` |

Parameters:

* `callback`: - The callback function.


Returns:

The index of the first element that satisfies the callback function.

### fill

Fills the matrix with the given value (in-place mutation).
Mutates this matrix and returns it for method chaining.

| Method | Type |
| ---------- | ---------- |
| `fill` | `(value: number) => this` |

Parameters:

* `value`: - The value to fill the matrix with.


Returns:

This matrix after filling (for chaining).

### mult

Returns a copy of the matrix multiplied by the vector.
The vector size must match the matrix column count. Result is a vector of size equal to the matrix row count.
Returns a copy of the matrix multiplied by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `mult` | `{ (other: Vector<NumberArray, TCols>): Vector<TArr, TRows>; <TOtherCols extends number>(other: Matrix<NumberArray, TOtherCols, TCols>): Matrix<...>; }` |

Parameters:

* `other`: - The vector to multiply.
* `other`: - The other matrix (its row count must match this matrix's column count).


Returns:

The resulting vector. The multiplied matrix.

### mult

Returns a copy of the matrix multiplied by the vector.
The vector size must match the matrix column count. Result is a vector of size equal to the matrix row count.
Returns a copy of the matrix multiplied by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `mult` | `{ (other: Vector<NumberArray, TCols>): Vector<TArr, TRows>; <TOtherCols extends number>(other: Matrix<NumberArray, TOtherCols, TCols>): Matrix<...>; }` |

Parameters:

* `other`: - The vector to multiply.
* `other`: - The other matrix (its row count must match this matrix's column count).


Returns:

The resulting vector. The multiplied matrix.

### mult

Returns a copy of the matrix multiplied by the vector.
The vector size must match the matrix column count. Result is a vector of size equal to the matrix row count.
Returns a copy of the matrix multiplied by the other matrix.

| Method | Type |
| ---------- | ---------- |
| `mult` | `{ (other: Vector<NumberArray, TCols>): Vector<TArr, TRows>; <TOtherCols extends number>(other: Matrix<NumberArray, TOtherCols, TCols>): Matrix<...>; }` |

Parameters:

* `other`: - The vector to multiply.
* `other`: - The other matrix (its row count must match this matrix's column count).


Returns:

The resulting vector. The multiplied matrix.

### add

Returns a copy of the matrix added by the other matrix (non-mutating).
Creates a new matrix instance without modifying this one.

| Method | Type |
| ---------- | ---------- |
| `add` | `(other: Vector<NumberArray, TCols> or Matrix<NumberArray, TRows, TCols>) => this` |

Parameters:

* `other`: - The other matrix.


Returns:

A new matrix with the result of addition.

### sub

Returns a copy of the matrix subtracted by the other matrix (non-mutating).
Creates a new matrix instance without modifying this one.

| Method | Type |
| ---------- | ---------- |
| `sub` | `(other: Matrix<NumberArray, TRows, TCols>) => this` |

Parameters:

* `other`: - The other matrix.


Returns:

A new matrix with the result of subtraction.

### div

Returns a copy of the matrix divided by the other matrix (non-mutating).
Creates a new matrix instance without modifying this one.

| Method | Type |
| ---------- | ---------- |
| `div` | `(other: Matrix<NumberArray, TRows, TCols>) => this` |

Parameters:

* `other`: - The other matrix.


Returns:

A new matrix with the result of division.

### addSelf

Adds the other matrix to this matrix (in-place mutation).
Mutates this matrix and returns it for method chaining.

| Method | Type |
| ---------- | ---------- |
| `addSelf` | `(other: Matrix<NumberArray, TRows, TCols>) => this` |

Parameters:

* `other`: - The other matrix.


Returns:

This matrix after addition (for chaining).

### subSelf

Subtracts the other matrix from this matrix (in-place mutation).
Mutates this matrix and returns it for method chaining.

| Method | Type |
| ---------- | ---------- |
| `subSelf` | `(other: Matrix<NumberArray, TRows, TCols>) => this` |

Parameters:

* `other`: - The other matrix.


Returns:

This matrix after subtraction (for chaining).

### scaleSelf

Multiplies this matrix by a scalar (in-place mutation).
Mutates this matrix and returns it for method chaining.

| Method | Type |
| ---------- | ---------- |
| `scaleSelf` | `(scalar: number) => this` |

Parameters:

* `scalar`: - The scalar value.


Returns:

This matrix after scaling (for chaining).

### dot

Returns the dot product of the matrix and the other matrix.

| Method | Type |
| ---------- | ---------- |
| `dot` | `(other: Vector<NumberArray, TCols> or Matrix<NumberArray, TRows, TCols>) => number` |

Parameters:

* `other`: - The other matrix.


Returns:

The dot product.

### equals

Returns true if the matrix is equal to the other matrix.

| Method | Type |
| ---------- | ---------- |
| `equals` | `(other: Vector<NumberArray, TCols> or Matrix<NumberArray, TRows, TCols>) => boolean` |

Parameters:

* `other`: - The other matrix.


Returns:

True if the matrix is equal to the other matrix.

### clone

Returns a copy of the matrix of the same type as this matrix.

| Method | Type |
| ---------- | ---------- |
| `clone` | `() => this` |

Returns:

A new matrix instance of the same class with copied data.

### transpose

Returns a transposed copy of the matrix (non-mutating).
Creates a new matrix instance without modifying this one.

| Method | Type |
| ---------- | ---------- |
| `transpose` | `() => Matrix<TArr, TRows, TCols>` |

Returns:

A new transposed matrix.

### toArray

Returns a copy of the matrix as an array.

| Method | Type |
| ---------- | ---------- |
| `toArray` | `() => number[]` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The array.

### toFloat32Array

Returns a copy of the underlying storage as a float32 array.

| Method | Type |
| ---------- | ---------- |
| `toFloat32Array` | `() => Float32Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The float32 array.

### toFloat64Array

Returns a copy of the underlying storage as a float64 array.

| Method | Type |
| ---------- | ---------- |
| `toFloat64Array` | `() => Float64Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The float64 array.

### toInt8Array

Returns a copy of the underlying storage as a int8 array.

| Method | Type |
| ---------- | ---------- |
| `toInt8Array` | `() => Int8Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The int8 array.

### toInt16Array

Returns a copy of the underlying storage as a int16 array.

| Method | Type |
| ---------- | ---------- |
| `toInt16Array` | `() => Int16Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The int16 array.

### toInt32Array

Returns a copy of the underlying storage as a int32 array.

| Method | Type |
| ---------- | ---------- |
| `toInt32Array` | `() => Int32Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The int32 array.

### toUint16Array

Returns a copy of the underlying storage as a uint16 array.

| Method | Type |
| ---------- | ---------- |
| `toUint16Array` | `() => Uint16Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The uint16 array.

### toUint8Array

Returns a copy of the underlying storage as a uint8 array.

| Method | Type |
| ---------- | ---------- |
| `toUint8Array` | `() => Uint8Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The uint8 array.

### toUint8ClampedArray

Returns a copy of the underlying storage as a uint8 clamped array.

| Method | Type |
| ---------- | ---------- |
| `toUint8ClampedArray` | `() => Uint8ClampedArray<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The uint8 clamped array.

### toUint32Array

Returns a copy of the underlying storage as a uint32 array.

| Method | Type |
| ---------- | ---------- |
| `toUint32Array` | `() => Uint32Array<ArrayBufferLike>` |

Parameters:

* `orientation`: - The orientation of the array (default: ColumnMajor for WebGL).


Returns:

The uint32 array.

# Interfaces

- [MatrixConstructor](#matrixconstructor)

## MatrixConstructor

Interface for the static side of Matrix classes, requiring identity method.

| Property | Type | Description |
| ---------- | ---------- | ---------- |

