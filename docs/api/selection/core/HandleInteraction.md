# HandleInteraction

Manages drag interactions on handles.
Calculates transform deltas and emits interaction events.

## Methods

- [setInteractionCallback](#setinteractioncallback)
- [start](#start)
- [update](#update)
- [end](#end)
- [cancel](#cancel)

### setInteractionCallback

Sets the callback for interaction events.

| Method | Type |
| ---------- | ---------- |
| `setInteractionCallback` | `(callback: HandleInteractionCallback or null) => void` |

### start

Starts an interaction with a handle.

| Method | Type |
| ---------- | ---------- |
| `start` | `(handle: Handle, startPosition: Vector2<Float32Array<ArrayBufferLike>>) => void` |

Parameters:

* `handle`: - The handle to interact with
* `startPosition`: - Starting position in world coordinates


### update

Updates the current position during an interaction.

| Method | Type |
| ---------- | ---------- |
| `update` | `(currentPosition: Vector2<Float32Array<ArrayBufferLike>>) => void` |

Parameters:

* `currentPosition`: - Current position in world coordinates


### end

Ends the current interaction.

| Method | Type |
| ---------- | ---------- |
| `end` | `() => void` |

### cancel

Cancels the current interaction.

| Method | Type |
| ---------- | ---------- |
| `cancel` | `() => void` |

# Enum

- [InteractionType](#interactiontype)

## InteractionType

Type of interaction being performed on a handle.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Resize` | `"resize"` |  |
| `Rotate` | `"rotate"` |  |
| `Move` | `"move"` |  |


# Interfaces

- [HandleInteractionData](#handleinteractiondata)

## HandleInteractionData

Data for handle interaction events.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `handle` | `Handle` | The handle being interacted with. |
| `type` | `InteractionType` | Type of interaction. |
| `startPosition` | `Vector2<Float32Array<ArrayBufferLike>>` | Starting position (in world coordinates). |
| `currentPosition` | `Vector2<Float32Array<ArrayBufferLike>>` | Current position (in world coordinates). |
| `delta` | `Vector2<Float32Array<ArrayBufferLike>>` | Delta from start position. |


# Types

- [HandleInteractionCallback](#handleinteractioncallback)

## HandleInteractionCallback

Callback type for handle interaction events.

| Type | Type |
| ---------- | ---------- |
| `HandleInteractionCallback` | `(data: HandleInteractionData) => void` |

