
# Interfaces

- [IArcanvasContext](#iarcanvascontext)

## IArcanvasContext

Minimal interface for Arcanvas context that is used by plugins, Stage, Camera, and other subsystems.
This interface allows these components to work without directly depending on the Arcanvas class,
making the code more testable and following dependency inversion principle.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `canvas` | `HTMLCanvasElement` | The canvas element. |
| `stage` | `Stage` | The stage (scene graph root). |
| `renderer` | `IRenderer` | The renderer instance. |
| `camera` | `Camera or null` | The current active camera. |

