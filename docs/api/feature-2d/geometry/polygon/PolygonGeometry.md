# PolygonGeometry

Utility class for building polygon geometry from various input formats.
Handles point parsing, shape creation, and mesh building.

## Static Methods

- [build](#build)

### build

Build polygon geometry from points.

| Method | Type |
| ---------- | ---------- |
| `build` | `(points: PointsArray, options?: PolygonGeometryOptions or undefined) => MeshBuildResult` |

Parameters:

* `points`: - Input points in various formats
* `options`: - Build options


Returns:

Mesh build result with vertices and indices

# Enum

- [PolygonSpace](#polygonspace)
- [PolygonBuildMode](#polygonbuildmode)

## PolygonSpace

Space/dimension mode for polygon geometry.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Auto` | `"auto"` | Automatically detect 2D vs 3D based on input format |
| `Space2D` | `"2d"` | Force 2D interpretation |
| `Space3D` | `"3d"` | Force 3D interpretation |


## PolygonBuildMode

Build mode for polygon geometry.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Outline` | `"outline"` | Outline mode - no triangulation, vertices as-is |
| `FillFan` | `"fill_fan"` | Fill mode - triangle fan from centroid |


# Interfaces

- [PolygonGeometryOptions](#polygongeometryoptions)

## PolygonGeometryOptions

Options for building polygon geometry.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `space` | `PolygonSpace or undefined` | Space/dimension mode (default: Auto) |
| `zIndex` | `number or undefined` | Z-index for 2D polygons (default: 0) |
| `mode` | `PolygonBuildMode or undefined` | Build mode (default: Outline) |

