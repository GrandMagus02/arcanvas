# ToolManager

Manages the currently active tool.
Forwards input events to the active tool.

## Methods

- [register](#register)
- [unregister](#unregister)
- [setActiveTool](#setactivetool)
- [getActiveTool](#getactivetool)
- [getTool](#gettool)
- [handleInput](#handleinput)

### register

Registers a tool.

| Method | Type |
| ---------- | ---------- |
| `register` | `(tool: Tool) => void` |

### unregister

Unregisters a tool.

| Method | Type |
| ---------- | ---------- |
| `unregister` | `(name: string) => void` |

### setActiveTool

Sets the active tool.
Deactivates the previous tool and activates the new one.

| Method | Type |
| ---------- | ---------- |
| `setActiveTool` | `(tool: string or Tool or null) => void` |

### getActiveTool

Gets the currently active tool.

| Method | Type |
| ---------- | ---------- |
| `getActiveTool` | `() => Tool or null` |

### getTool

Gets a tool by name.

| Method | Type |
| ---------- | ---------- |
| `getTool` | `(name: string) => Tool or undefined` |

### handleInput

Handles an input event by forwarding it to the active tool.

| Method | Type |
| ---------- | ---------- |
| `handleInput` | `(event: NormalizedInputEvent, state: InputState) => void` |
