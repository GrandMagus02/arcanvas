# PolygonMesh

Base class for polygon meshes that handles rendering with a shared material.

## Methods

- [setViewProjection](#setviewprojection)
- [setFill](#setfill)
- [getFill](#getfill)
- [setProjectionMatrix](#setprojectionmatrix)

### setViewProjection

Set the view-projection matrix (combines view and projection).
If null, uses identity matrix (no transformation).

| Method | Type |
| ---------- | ---------- |
| `setViewProjection` | `(matrix: TransformationMatrix or null) => void` |

### setFill

| Method | Type |
| ---------- | ---------- |
| `setFill` | `(fill: PolygonFill) => void` |

### getFill

| Method | Type |
| ---------- | ---------- |
| `getFill` | `() => PolygonFill` |

### setProjectionMatrix

Set the projection matrix (deprecated: use setViewProjection instead).

| Method | Type |
| ---------- | ---------- |
| `setProjectionMatrix` | `(matrix: TransformationMatrix or null) => void` |
