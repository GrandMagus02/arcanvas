# WorldScene

WorldScene extends Scene with floating origin support.

This scene can contain both regular entities and world-positioned entities.
World-positioned entities have their local positions automatically updated
when the world origin changes.

## Methods

- [addObject](#addobject)
- [addLight](#addlight)
- [updateForCamera](#updateforcamera)
- [updateObjectLocal](#updateobjectlocal)
- [forceUpdateAllLocalPositions](#forceupdatealllocalpositions)
- [localToWorld](#localtoworld)

### addObject

Adds an object to the scene.

| Method | Type |
| ---------- | ---------- |
| `addObject` | `(object: Entity) => void` |

### addLight

Adds a light to the scene.

| Method | Type |
| ---------- | ---------- |
| `addLight` | `(light: Light) => void` |

### updateForCamera

Updates the scene for rendering from a camera at the given world position.

| Method | Type |
| ---------- | ---------- |
| `updateForCamera` | `(cameraWorldPos: WorldVec3) => boolean` |

Returns:

true if recentering occurred

### updateObjectLocal

Updates a single object's local position.

| Method | Type |
| ---------- | ---------- |
| `updateObjectLocal` | `(obj: WorldPositioned) => void` |

### forceUpdateAllLocalPositions

Forces update of all object local positions.

| Method | Type |
| ---------- | ---------- |
| `forceUpdateAllLocalPositions` | `() => void` |

### localToWorld

| Method | Type |
| ---------- | ---------- |
| `localToWorld` | `(local: Float32Array<ArrayBufferLike> or number[], offset?: number) => WorldVec3` |

## Properties

- [viewport](#viewport)
- [lights](#lights)

### viewport

| Property | Type |
| ---------- | ---------- |
| `viewport` | `WorldSceneViewport` |

### lights

| Property | Type |
| ---------- | ---------- |
| `lights` | `Light[]` |

# Interfaces

- [WorldSceneViewport](#worldsceneviewport)

## WorldSceneViewport

Scene viewport dimensions.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `width` | `number` |  |
| `height` | `number` |  |

