# Camera

Base Camera class that controls the view and projection.
Cameras are not Nodes - they are separate instances that control what is rendered.

## Methods

- [move](#move)
- [rotateX](#rotatex)
- [rotateY](#rotatey)
- [rotateZ](#rotatez)
- [getViewProjectionMatrix](#getviewprojectionmatrix)

### move

| Method | Type |
| ---------- | ---------- |
| `move` | `(dx: number, dy: number, dz: number) => void` |

### rotateX

| Method | Type |
| ---------- | ---------- |
| `rotateX` | `(dx: number) => void` |

### rotateY

| Method | Type |
| ---------- | ---------- |
| `rotateY` | `(dy: number) => void` |

### rotateZ

| Method | Type |
| ---------- | ---------- |
| `rotateZ` | `(dz: number) => void` |

### getViewProjectionMatrix

Get the combined view-projection matrix (projection * view).
This matrix transforms world coordinates to clip space.

| Method | Type |
| ---------- | ---------- |
| `getViewProjectionMatrix` | `() => TransformationMatrix` |

Returns:

A TransformationMatrix representing the view-projection transformation.
