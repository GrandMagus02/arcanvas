# WorldScene

WorldScene extends Scene with floating origin support.

This scene can contain both regular RenderObjects and WorldRenderObjects.
WorldRenderObjects have their local positions automatically updated
when the world origin changes.

Usage:
1. Create a WorldScene
2. Add WorldRenderObjects with world-space positions
3. Before rendering, call `updateForCamera(camera.worldPosition)`
4. The scene will auto-recenter if needed and update all local positions

## Methods

- [addObject](#addobject)
- [addLight](#addlight)
- [updateForCamera](#updateforcamera)
- [updateObjectLocal](#updateobjectlocal)
- [forceUpdateAllLocalPositions](#forceupdatealllocalpositions)
- [localToWorld](#localtoworld)

### addObject

Adds a render object to the scene.

| Method | Type |
| ---------- | ---------- |
| `addObject` | `(object: RenderObject or WorldRenderObject) => void` |

### addLight

Adds a light to the scene.

| Method | Type |
| ---------- | ---------- |
| `addLight` | `(light: Light) => void` |

### updateForCamera

Updates the scene for rendering from a camera at the given world position.

This should be called once per frame before rendering:
1. Checks if the world origin needs recentering
2. If recentered, updates all WorldRenderObject local positions
3. If not recentered but origin is dirty, still updates positions

| Method | Type |
| ---------- | ---------- |
| `updateForCamera` | `(cameraWorldPos: WorldVec3) => boolean` |

Parameters:

* `cameraWorldPos`: The camera's current world-space position


Returns:

true if recentering occurred

### updateObjectLocal

Updates a single object's local position.
Call this when adding a new WorldRenderObject to an existing scene.

| Method | Type |
| ---------- | ---------- |
| `updateObjectLocal` | `(obj: WorldRenderObject) => void` |

### forceUpdateAllLocalPositions

Forces update of all object local positions.
Call this after bulk changes to the scene.

| Method | Type |
| ---------- | ---------- |
| `forceUpdateAllLocalPositions` | `() => void` |

### localToWorld

Converts a local position back to world position.

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

