# PolygonShape2D

2D polygon shape implementation.

# PolygonShape3D

3D polygon shape implementation.

# Interfaces

- [Shape](#shape)
- [Shape2D](#shape2d)
- [Shape3D](#shape3d)

## Shape

Base interface for geometric shapes.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `dim` | `number` |  |


## Shape2D

A 2D shape defined by flat points [x0, y0, x1, y1, ...].

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `dim` | `2` |  |
| `points` | `Float32Array<ArrayBufferLike>` |  |


## Shape3D

A 3D shape defined by flat points [x0, y0, z0, x1, y1, z1, ...].

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `dim` | `3` |  |
| `points` | `Float32Array<ArrayBufferLike>` |  |

