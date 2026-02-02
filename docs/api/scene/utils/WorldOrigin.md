# WorldOrigin

Manages the world origin for floating-point precision.
When objects move far from the origin, this can "recenter" them
to keep coordinates small enough for Float32.

## Methods

- [clearDirty](#cleardirty)
- [update](#update)
- [recenterTo](#recenterto)
- [updateLocalPositions](#updatelocalpositions)
- [updateLocalPosition](#updatelocalposition)
- [localToWorld](#localtoworld)

### clearDirty

| Method | Type |
| ---------- | ---------- |
| `clearDirty` | `() => void` |

### update

Updates the origin based on camera position.
Returns true if recentering occurred.

| Method | Type |
| ---------- | ---------- |
| `update` | `(cameraPos: WorldVec3, objects: Iterable<WorldPositioned>) => boolean` |

### recenterTo

Recenters the origin to the given position.

| Method | Type |
| ---------- | ---------- |
| `recenterTo` | `(newOrigin: WorldVec3, objects: Iterable<WorldPositioned>) => void` |

### updateLocalPositions

Updates local positions for all objects.

| Method | Type |
| ---------- | ---------- |
| `updateLocalPositions` | `(objects: Iterable<WorldPositioned>) => void` |

### updateLocalPosition

Updates local position for a single object.

| Method | Type |
| ---------- | ---------- |
| `updateLocalPosition` | `(obj: WorldPositioned) => void` |

### localToWorld

Converts a local position back to world position.

| Method | Type |
| ---------- | ---------- |
| `localToWorld` | `(local: Float32Array<ArrayBufferLike> or number[], offset?: number) => WorldVec3` |

# Interfaces

- [WorldPositioned](#worldpositioned)
- [WorldOriginOptions](#worldoriginoptions)

## WorldPositioned

Interface for objects that have a world position and local position.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `worldPosition` | `WorldVec3` |  |
| `localPosition` | `Float32Array<ArrayBufferLike>` |  |


## WorldOriginOptions

Options for WorldOrigin behavior.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `recenterThreshold` | `number` |  |
| `autoRecenter` | `boolean` |  |
| `snapToGrid` | `boolean` |  |
| `gridSize` | `number` |  |

