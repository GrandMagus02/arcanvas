# BoundingBox2D

2D bounding box implementation.
Represents an axis-aligned bounding box in 2D space.

## Static Methods

- [fromPoints](#frompoints)
- [fromPolygon](#frompolygon)
- [fromTransformedPoints](#fromtransformedpoints)
- [empty](#empty)

### fromPoints

Creates a bounding box from an array of 2D points.

| Method | Type |
| ---------- | ---------- |
| `fromPoints` | `(points: Vector2<Float32Array<ArrayBufferLike>>[] or { x: number; y: number; }[]) => BoundingBox2D` |

### fromPolygon

Creates a bounding box from a Polygon2DObject.
Extracts points from the polygon's mesh vertices.

| Method | Type |
| ---------- | ---------- |
| `fromPolygon` | `(polygon: Polygon2DObject, transform?: Transform or undefined) => BoundingBox2D` |

### fromTransformedPoints

Creates a bounding box from points transformed by a matrix.
Transforms each point and then computes the bounding box.

| Method | Type |
| ---------- | ---------- |
| `fromTransformedPoints` | `(points: { x: number; y: number; }[], matrix: Matrix4<Float32Array<ArrayBufferLike>>) => BoundingBox2D` |

### empty

Creates an empty bounding box.

| Method | Type |
| ---------- | ---------- |
| `empty` | `() => BoundingBox2D` |

## Methods

- [transform](#transform)
- [getCorners](#getcorners)
- [getCenter](#getcenter)
- [getWidth](#getwidth)
- [getHeight](#getheight)
- [contains](#contains)
- [intersects](#intersects)
- [union](#union)

### transform

Transforms this bounding box by a matrix.
Transforms all four corners and computes a new axis-aligned bounding box.

| Method | Type |
| ---------- | ---------- |
| `transform` | `(matrix: Matrix4<Float32Array<ArrayBufferLike>>) => BoundingBox2D` |

### getCorners

Gets the four corners of the bounding box.

| Method | Type |
| ---------- | ---------- |
| `getCorners` | `() => { x: number; y: number; }[]` |

### getCenter

Gets the center point of the bounding box.

| Method | Type |
| ---------- | ---------- |
| `getCenter` | `() => { x: number; y: number; }` |

### getWidth

Gets the width of the bounding box.

| Method | Type |
| ---------- | ---------- |
| `getWidth` | `() => number` |

### getHeight

Gets the height of the bounding box.

| Method | Type |
| ---------- | ---------- |
| `getHeight` | `() => number` |

### contains

Checks if a point is inside the bounding box.

| Method | Type |
| ---------- | ---------- |
| `contains` | `(point: { x: number; y: number; z?: number or undefined; }) => boolean` |

### intersects

Checks if this bounding box intersects with another.

| Method | Type |
| ---------- | ---------- |
| `intersects` | `(other: BoundingBox2D) => boolean` |

### union

Creates a union of this bounding box with another.

| Method | Type |
| ---------- | ---------- |
| `union` | `(other: BoundingBox2D) => BoundingBox2D` |

## Properties

- [minX](#minx)
- [minY](#miny)
- [maxX](#maxx)
- [maxY](#maxy)

### minX

| Property | Type |
| ---------- | ---------- |
| `minX` | `number` |

### minY

| Property | Type |
| ---------- | ---------- |
| `minY` | `number` |

### maxX

| Property | Type |
| ---------- | ---------- |
| `maxX` | `number` |

### maxY

| Property | Type |
| ---------- | ---------- |
| `maxY` | `number` |
