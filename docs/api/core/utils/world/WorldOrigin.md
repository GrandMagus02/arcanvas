# WorldOrigin

WorldOrigin manages the floating origin for large-world rendering.

The key insight is that we want to keep coordinates small on the GPU
while supporting arbitrarily large world coordinates in the engine.

This is achieved by:
1. Storing all positions in double-precision world coordinates
2. Maintaining a "world origin" point (also in doubles)
3. Computing local positions as (world - origin) when needed for rendering
4. Periodically shifting the origin to keep local coordinates small

Two main strategies:

**Floating Origin**: Origin shifts when camera moves far enough.
All local positions are updated. Good for continuous large worlds.

**Camera-Relative**: Origin is always at camera position.
Local positions computed fresh each frame. Simpler but more computation.

This implementation supports both - use `mode` option to choose.

## Methods

- [clearDirty](#cleardirty)
- [needsRecenter](#needsrecenter)
- [recenterTo](#recenterto)
- [updateLocalPositions](#updatelocalpositions)
- [updateLocalPosition](#updatelocalposition)
- [computeLocal](#computelocal)
- [computeLocalInto](#computelocalinto)
- [update](#update)
- [localToWorld](#localtoworld)
- [setOptions](#setoptions)

### clearDirty

Clears the dirty flag.

| Method | Type |
| ---------- | ---------- |
| `clearDirty` | `() => void` |

### needsRecenter

Checks if the given position is far enough from the origin to trigger recentering.

| Method | Type |
| ---------- | ---------- |
| `needsRecenter` | `(position: WorldVec3Like) => boolean` |

### recenterTo

Recenters the origin to a new position.

If snapToGrid is enabled, the position will be snapped to the nearest grid point.

| Method | Type |
| ---------- | ---------- |
| `recenterTo` | `(newOrigin: WorldVec3Like, objects?: Iterable<WorldPositioned> or undefined) => void` |

Parameters:

* `newOrigin`: The new origin position (typically camera position)
* `objects`: Optional iterable of objects to update local positions for


### updateLocalPositions

Updates local positions for a set of objects based on current origin.
Call this after recentering or when objects are added to the scene.

| Method | Type |
| ---------- | ---------- |
| `updateLocalPositions` | `(objects: Iterable<WorldPositioned>) => void` |

### updateLocalPosition

Updates a single object's local position based on current origin.

| Method | Type |
| ---------- | ---------- |
| `updateLocalPosition` | `(obj: WorldPositioned) => void` |

### computeLocal

Computes the local position for a world position without storing it.
Useful for temporary calculations.

| Method | Type |
| ---------- | ---------- |
| `computeLocal` | `(worldPos: WorldVec3Like) => Float32Array<ArrayBufferLike>` |

### computeLocalInto

Computes local position into a provided array.
More efficient when you need to store the result.

| Method | Type |
| ---------- | ---------- |
| `computeLocalInto` | `(worldPos: WorldVec3Like, target: Float32Array<ArrayBufferLike>, offset?: number) => void` |

### update

Call this each frame (or when camera moves significantly).
Checks if recentering is needed and performs it if autoRecenter is enabled.

| Method | Type |
| ---------- | ---------- |
| `update` | `(cameraWorldPos: WorldVec3Like, objects?: Iterable<WorldPositioned> or undefined) => boolean` |

Parameters:

* `cameraWorldPos`: Current camera position in world space
* `objects`: Objects to update if recentering occurs


Returns:

true if recentering occurred

### localToWorld

Converts a local position back to world position.
Useful for raycasting, picking, etc.

| Method | Type |
| ---------- | ---------- |
| `localToWorld` | `(local: Float32Array<ArrayBufferLike> or number[], offset?: number) => WorldVec3` |

### setOptions

Updates options dynamically.

| Method | Type |
| ---------- | ---------- |
| `setOptions` | `(options: Partial<WorldOriginOptions>) => void` |

# Interfaces

- [WorldPositioned](#worldpositioned)
- [WorldOriginOptions](#worldoriginoptions)

## WorldPositioned

Interface for objects that have a world-space position.
This is used by WorldOrigin to update local positions when recentering.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `worldPosition` | `WorldVec3Like` | The object's position in world-space (double precision). |
| `localPosition` | `Float32Array<ArrayBufferLike>` | The object's position relative to the current origin (float32-safe). This is updated by WorldOrigin when recentering. |


## WorldOriginOptions

Options for WorldOrigin behavior.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recenterThreshold` | `number` | Distance threshold for automatic recentering. When the camera moves more than this distance from the origin, the origin will be shifted to the camera position. Default: 10,000 units (10km at 1 unit = 1 meter) |
| `autoRecenter` | `boolean` | If true, automatically recenter when updateOrigin is called and the camera exceeds the threshold. Default: true |
| `snapToGrid` | `boolean` | If true, snap the origin to a grid when recentering. This can help with floating point stability. Default: false |
| `gridSize` | `number` | Grid size for snapping (only used if snapToGrid is true). Default: 1000 |

