# HitTest2D

2D hit-testing utilities for point-in-shape detection.

## Static Methods

- [pointInPolygon](#pointinpolygon)
- [pointInBounds](#pointinbounds)
- [hitTestPolygon](#hittestpolygon)
- [screenToWorld](#screentoworld)

### pointInPolygon

Point-in-polygon test using ray casting algorithm.
Casts a ray from the point to infinity and counts intersections with polygon edges.

| Method | Type |
| ---------- | ---------- |
| `pointInPolygon` | `(point: { x: number; y: number; }, vertices: { x: number; y: number; }[]) => boolean` |

Parameters:

* `point`: - Point to test
* `vertices`: - Array of polygon vertices (closed polygon, last vertex should connect to first)


Returns:

True if point is inside the polygon

### pointInBounds

Point-in-bounding-box test.

| Method | Type |
| ---------- | ---------- |
| `pointInBounds` | `(point: { x: number; y: number; }, bounds: BoundingBox2D) => boolean` |

Parameters:

* `point`: - Point to test
* `bounds`: - Bounding box to test against


Returns:

True if point is inside the bounding box

### hitTestPolygon

Hit test against a Polygon2DObject.
Accounts for the object's transform and converts screen coordinates to world coordinates.

| Method | Type |
| ---------- | ---------- |
| `hitTestPolygon` | `(screenPoint: { x: number; y: number; }, polygon: Polygon2DObject, transform: Transform, camera: Camera) => boolean` |

Parameters:

* `screenPoint`: - Point in screen coordinates (pixels, origin at top-left)
* `polygon`: - Polygon object to test
* `transform`: - Transform of the polygon
* `camera`: - Camera for coordinate conversion


Returns:

True if the screen point hits the polygon

### screenToWorld

Converts screen coordinates to world coordinates.

| Method | Type |
| ---------- | ---------- |
| `screenToWorld` | `(screenPoint: { x: number; y: number; }, camera: Camera) => { x: number; y: number; }` |

Parameters:

* `screenPoint`: - Point in screen coordinates (pixels, origin at top-left)
* `camera`: - Camera for coordinate conversion


Returns:

Point in world coordinates
