# PointUtils

Utility class for working with point arrays.

## Static Methods

- [points2DFromArray](#points2dfromarray)
- [toFlat2D](#toflat2d)
- [toFlat3D](#toflat3d)

### points2DFromArray

Parse points from either a flat array [x0, y0, x1, y1, ...] or array of arrays [[x0, y0], [x1, y1], ...].
If a flat array has odd length, the last value is treated as X and Y defaults to 0.

| Method | Type |
| ---------- | ---------- |
| `points2DFromArray` | `(points: PointsArray) => { x: number; y: number; }[]` |

Parameters:

* `points`: - Array of points in either format.


Returns:

Array of parsed points with x and y properties.

### toFlat2D

Convert points to a flat Float32Array of 2D coordinates [x0, y0, x1, y1, ...].

| Method | Type |
| ---------- | ---------- |
| `toFlat2D` | `(points: PointsArray) => Float32Array<ArrayBufferLike>` |

Parameters:

* `points`: - Array of points in either format.


Returns:

Float32Array with 2D coordinates.

### toFlat3D

Convert points to a flat Float32Array of 3D coordinates [x0, y0, z0, x1, y1, z1, ...].

| Method | Type |
| ---------- | ---------- |
| `toFlat3D` | `(points: PointsArray, zDefault?: number) => Float32Array<ArrayBufferLike>` |

Parameters:

* `points`: - Array of points in either format.
* `zDefault`: - The Z coordinate to use for all points (default: 0).


Returns:

Float32Array with 3D coordinates.

# Types

- [PointsArray](#pointsarray)

## PointsArray

Type for point arrays. Can be a flat array [x0, y0, x1, y1, ...] or array of arrays [[x0, y0], [x1, y1], ...].
If a flat array has odd length, the last value is treated as X and Y defaults to 0.

| Type | Type |
| ---------- | ---------- |
| `PointsArray` | `number[] or number[][]` |

