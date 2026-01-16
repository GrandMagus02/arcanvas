# Functions

- [compose2DProjection4x4](#compose2dprojection4x4)

## compose2DProjection4x4

Composes a 2D camera matrix as a 4x4 (row-major):
M = P · Rz(rotation) · T(-x, -y, 0)

- Maps pixel coordinates to clip space:
  x ∈ [0, width]  -> clipX ∈ [-1, 1]
  y ∈ [0, height] -> clipY ∈ [ 1,-1] (Y flipped)
- Applies camera rotation and translation (pan).
- Leaves Z unchanged (good for 2D at z=0).

| Function | Type |
| ---------- | ---------- |
| `compose2DProjection4x4` | `(width: number, height: number, x?: number, y?: number, rotation?: number) => Float32Array<ArrayBufferLike>` |

Parameters:

* `width`: - Canvas width in pixels
* `height`: - Canvas height in pixels
* `x`: - Camera X position in pixels (default: 0)
* `y`: - Camera Y position in pixels (default: 0)
* `rotation`: - Camera rotation in radians (default: 0)


Returns:

Row-major 4x4 matrix as Float32Array(16)


