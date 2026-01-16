# Polygon2D

A 2D Polygon mesh defined by a list of points.
Automatically triangulates the polygon using a triangle fan from the centroid.

## Constructors

`public`: Create a new Polygon2D.

Parameters:

* `points`: - Array of points. Can be a flat array [x0, y0, x1, y1, ...] or array of arrays [[x0, y0], [x1, y1], ...].
  If a flat array has odd length, the last value is treated as X and Y defaults to 0.
* `options`


# Interfaces

- [Polygon2DOptions](#polygon2doptions)

## Polygon2DOptions

Options for creating a Polygon2D.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `zIndex` | `number or undefined` | The Z-index of the polygon. |

