# WorldRenderer

WorldRenderer extends Renderer with camera-relative rendering for large worlds.

Key difference from standard Renderer:
- Objects with WorldTransform have their model matrices computed relative to camera
- The view matrix represents camera orientation only (no translation)
- This keeps all values small and avoids Float32 precision issues

The math works out the same:
  Standard: clipPos = proj * view * model * vertexPos
  Camera-relative: clipPos = proj * (view * (model_relative_to_camera * vertexPos))

Where model_relative_to_camera has translation = objectWorldPos - cameraWorldPos
and view has no translation (or just rotation for 3D).

## Methods

- [render](#render)

### render

Renders a WorldScene with camera-relative coordinates.

| Method | Type |
| ---------- | ---------- |
| `render` | `(scene: WorldScene, camera: Camera or WorldCamera) => void` |

Parameters:

* `scene`: The scene to render
* `camera`: The camera (must have worldPosition for proper results)

