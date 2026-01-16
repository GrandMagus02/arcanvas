
# Interfaces

- [IRenderer](#irenderer)

## IRenderer

Abstract interface for renderer implementations.
Allows the same application code to work with different rendering backends (WebGL, Canvas2D, WebGPU, etc.).

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `isAvailable` | `boolean` | Whether the renderer is available and ready to use. |

