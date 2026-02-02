
# Interfaces

- [IHandleRenderer](#ihandlerenderer)
- [RenderContext](#rendercontext)

## IHandleRenderer

Interface for rendering selection handles.
Dimension-specific implementations (HandleRenderer2D, HandleRenderer3D) should implement this.

| Property | Type | Description |
| ---------- | ---------- | ---------- |


## RenderContext

Rendering context passed to handle renderers.
Contains camera, viewport, and other rendering state.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `camera` | `unknown` |  |
| `viewport` | `{ width: number; height: number; }` |  |

