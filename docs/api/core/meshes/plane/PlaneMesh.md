# PlaneMesh

## Methods

- [setViewProjection](#setviewprojection)
- [setProjectionMatrix](#setprojectionmatrix)

### setViewProjection

Set the view-projection matrix (combines view and projection).
If null, uses identity matrix (no transformation).

| Method | Type |
| ---------- | ---------- |
| `setViewProjection` | `(matrix: TransformationMatrix or null) => void` |

### setProjectionMatrix

Set the projection matrix (deprecated: use setViewProjection instead).

| Method | Type |
| ---------- | ---------- |
| `setProjectionMatrix` | `(matrix: TransformationMatrix or null) => void` |
