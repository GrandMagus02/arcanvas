# Scene

Scene root for the engine-level renderer.
Provides a container for entities and lights.

## Methods

- [addObject](#addobject)
- [addLight](#addlight)

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

## Properties

- [viewport](#viewport)
- [lights](#lights)

### viewport

| Property | Type |
| ---------- | ---------- |
| `viewport` | `SceneViewport` |

### lights

| Property | Type |
| ---------- | ---------- |
| `lights` | `Light[]` |

# Interfaces

- [SceneViewport](#sceneviewport)
- [Renderable](#renderable)

## SceneViewport

Scene viewport dimensions.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `width` | `number` |  |
| `height` | `number` |  |


## Renderable

Interface for renderable objects (duck typing for cross-package compatibility).

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `mesh` | `unknown` |  |
| `material` | `unknown` |  |

