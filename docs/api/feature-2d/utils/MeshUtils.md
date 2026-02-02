# MeshUtils

Utility class for mesh operations.

## Static Methods

- [createTriangleFan](#createtrianglefan)
- [createTriangleFanIndexed](#createtrianglefanindexed)

### createTriangleFan

Creates a triangle fan from a set of points.
Connects the centroid of the points to each pair of adjacent vertices.
Returns unique vertices and indices for efficient indexed rendering.

| Method | Type |
| ---------- | ---------- |
| `createTriangleFan` | `(points: { x: number; y: number; }[], z?: number) => Float32Array<ArrayBufferLike>` |

Parameters:

* `points`: - The list of points defining the polygon perimeter.
* `z`: - The Z coordinate to use for all vertices (default: 0).


Returns:

A Float32Array containing the vertex data (x, y, z) for the triangles.

### createTriangleFanIndexed

Creates an indexed triangle fan from a set of points.
Connects the centroid of the points to each pair of adjacent vertices.
Returns unique vertices and indices for efficient indexed rendering.

| Method | Type |
| ---------- | ---------- |
| `createTriangleFanIndexed` | `(points: { x: number; y: number; }[], z?: number) => MeshBuildResult` |

Parameters:

* `points`: - The list of points defining the polygon perimeter.
* `z`: - The Z coordinate to use for all vertices (default: 0).


Returns:

An object containing unique vertices and triangle fan indices.

# Interfaces

- [MeshBuildResult](#meshbuildresult)

## MeshBuildResult

Result of mesh building operations containing vertices and indices.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `vertices` | `Float32Array<ArrayBufferLike>` |  |
| `indices` | `Uint16Array<ArrayBufferLike>` |  |

