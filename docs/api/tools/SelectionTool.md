# SelectionTool

Selection tool for selecting and manipulating 2D objects.

## Methods

- [setCamera](#setcamera)
- [registerSelectable](#registerselectable)
- [unregisterSelectable](#unregisterselectable)
- [activate](#activate)
- [deactivate](#deactivate)
- [handleInput](#handleinput)
- [renderHandles](#renderhandles)

### setCamera

Sets the camera for coordinate conversion.

| Method | Type |
| ---------- | ---------- |
| `setCamera` | `(camera: Camera or null) => void` |

### registerSelectable

Registers a selectable object.

| Method | Type |
| ---------- | ---------- |
| `registerSelectable` | `(selectable: ISelectable) => void` |

### unregisterSelectable

Unregisters a selectable object.

| Method | Type |
| ---------- | ---------- |
| `unregisterSelectable` | `(id: string) => void` |

### activate

Called when the tool is activated.

| Method | Type |
| ---------- | ---------- |
| `activate` | `() => void` |

### deactivate

Called when the tool is deactivated.

| Method | Type |
| ---------- | ---------- |
| `deactivate` | `() => void` |

### handleInput

Handles an input event.

| Method | Type |
| ---------- | ---------- |
| `handleInput` | `(event: NormalizedInputEvent, state: InputState) => void` |

### renderHandles

Renders selection handles (called by renderer).

| Method | Type |
| ---------- | ---------- |
| `renderHandles` | `(context: { camera: Camera; viewport: { width: number; height: number; }; }) => void` |

# Interfaces

- [SelectionToolOptions](#selectiontooloptions)

## SelectionToolOptions

Options for SelectionTool.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `camera` | `Camera or undefined` | Camera to use for coordinate conversion. |
| `selectionManager` | `SelectionManager or undefined` | Selection manager to use. |
| `handleRenderer` | `HandleRenderer2D or undefined` | Handle renderer to use. |
| `handleStyle` | `"photoshop" or "konva" or undefined` | Handle style to use. |

