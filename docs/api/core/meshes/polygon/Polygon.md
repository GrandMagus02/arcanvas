# Polygon

A 3D Polygon mesh defined by a list of points.
Points can be provided as a flat array [x0, y0, z0, x1, y1, z1, ...] or as 2D points [x0, y0, x1, y1, ...] with z=0.

## Constructors

`public`: Create a new Polygon.

Parameters:

* `points`: - Array of points. Can be a flat array of 3D coordinates [x0, y0, z0, x1, y1, z1, ...]
  or 2D coordinates [x0, y0, x1, y1, ...] which will be treated as [x0, y0, 0, x1, y1, 0, ...].
  If a 2D flat array has odd length, the last value is treated as X and Y defaults to 0.

