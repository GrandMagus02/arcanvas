# WorldCamera

WorldCamera extends Camera with world-space coordinate support.

Key concepts:
- `_worldPos` stores the camera position in double-precision (JS number)
- For rendering, we use camera-relative coordinates where the camera is always at (0,0,0)
- The view matrix represents orientation only (no translation for 2D, lookAt for 3D)

This enables "infinite" zoom and pan without precision issues:
- Objects store their positions in world-space (double)
- At render time, we compute `objectWorldPos - cameraWorldPos` (still in double)
- Only the result (which is small) gets converted to Float32 for the GPU

## Methods

- [move](#move)
- [setWorldPosition](#setworldposition)
- [rotateX](#rotatex)
- [rotateY](#rotatey)
- [rotateZ](#rotatez)
- [getViewProjectionMatrix](#getviewprojectionmatrix)

### move

Moves the camera by the given delta in world space.

| Method | Type |
| ---------- | ---------- |
| `move` | `(dx: number, dy: number, dz: number) => void` |

### setWorldPosition

Sets the camera position directly in world space.

| Method | Type |
| ---------- | ---------- |
| `setWorldPosition` | `(x: number, y: number, z: number) => this` |

### rotateX

| Method | Type |
| ---------- | ---------- |
| `rotateX` | `(_dx: number) => void` |

### rotateY

| Method | Type |
| ---------- | ---------- |
| `rotateY` | `(_dy: number) => void` |

### rotateZ

| Method | Type |
| ---------- | ---------- |
| `rotateZ` | `(_dz: number) => void` |

### getViewProjectionMatrix

Get the combined view-projection matrix.
For camera-relative rendering, this is just the projection matrix
since view is identity.

| Method | Type |
| ---------- | ---------- |
| `getViewProjectionMatrix` | `() => TransformationMatrix` |
