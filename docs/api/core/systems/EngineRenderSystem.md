# EngineRenderSystem

Render system for the engine-level renderer/backends.

## Methods

- [renderOnce](#renderonce)
- [setDebugMode](#setdebugmode)
- [getDebugMode](#getdebugmode)
- [setDebugTriangles](#setdebugtriangles)

### renderOnce

| Method | Type |
| ---------- | ---------- |
| `renderOnce` | `() => void` |

### setDebugMode

Sets the debug visualization mode.

| Method | Type |
| ---------- | ---------- |
| `setDebugMode` | `(mode: DebugMode, options?: Partial<Omit<DebugOptions, "mode">> or undefined) => void` |

Parameters:

* `mode`: - The debug mode to enable, or "none" to disable.
* `options`: - Additional debug options.


### getDebugMode

Gets the current debug options.

| Method | Type |
| ---------- | ---------- |
| `getDebugMode` | `() => DebugOptions` |

### setDebugTriangles

Convenience method to toggle debug triangles mode (like UE4/UE5).

| Method | Type |
| ---------- | ---------- |
| `setDebugTriangles` | `(enabled: boolean, colorSeed?: number or undefined) => void` |

Parameters:

* `enabled`: - Whether to enable or disable debug triangles.
* `colorSeed`: - Optional seed for consistent colors across frames.


# Interfaces

- [EngineRenderSystemOptions](#enginerendersystemoptions)

## EngineRenderSystemOptions

Options for EngineRenderSystem.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `backend` | `BackendType` |  |

