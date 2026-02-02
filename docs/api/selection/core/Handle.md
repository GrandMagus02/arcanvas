# Handle

Represents a single interactive handle for selection manipulation.

## Methods

- [contains](#contains)
- [render](#render)

### contains

Checks if a point (in world coordinates) is inside this handle.

| Method | Type |
| ---------- | ---------- |
| `contains` | `(point: Vector2<Float32Array<ArrayBufferLike>>, pixelSize?: number) => boolean` |

Parameters:

* `point`: - Point to test in world coordinates
* `pixelSize`: - Size of a pixel in world units (for accurate hit-testing)


Returns:

True if the point is inside the handle

### render

Renders this handle using the provided renderer.

| Method | Type |
| ---------- | ---------- |
| `render` | `(renderer: IHandleRenderer, context: RenderContext) => void` |

Parameters:

* `renderer`: - The handle renderer to use
* `context`: - Rendering context


## Properties

- [position](#position)
- [size](#size)
- [cursor](#cursor)
- [edgePosition](#edgeposition)
- [cornerPosition](#cornerposition)
- [id](#id)

### position

Position of the handle in world coordinates.

| Property | Type |
| ---------- | ---------- |
| `position` | `Vector2<Float32Array<ArrayBufferLike>>` |

### size

Size of the handle in pixels (for hit-testing).

| Property | Type |
| ---------- | ---------- |
| `size` | `number` |

### cursor

CSS cursor style when hovering over this handle.

| Property | Type |
| ---------- | ---------- |
| `cursor` | `string` |

### edgePosition

Optional edge position (for edge handles).

| Property | Type |
| ---------- | ---------- |
| `edgePosition` | `EdgePosition or undefined` |

### cornerPosition

Optional corner position (for corner handles).

| Property | Type |
| ---------- | ---------- |
| `cornerPosition` | `CornerPosition or undefined` |

### id

Optional identifier for this handle.

| Property | Type |
| ---------- | ---------- |
| `id` | `string or undefined` |

# Enum

- [HandleType](#handletype)
- [EdgePosition](#edgeposition)
- [CornerPosition](#cornerposition)

## HandleType

Types of handles for different interactions.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Corner` | `"corner"` | Corner handle - can resize in both X and Y |
| `Edge` | `"edge"` | Edge handle - can resize in one direction |
| `Rotation` | `"rotation"` | Rotation handle - rotates the object |


## EdgePosition

Edge positions for edge handles.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `Top` | `"top"` |  |
| `Bottom` | `"bottom"` |  |
| `Left` | `"left"` |  |
| `Right` | `"right"` |  |


## CornerPosition

Corner positions for corner handles.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `TopLeft` | `"top-left"` |  |
| `TopRight` | `"top-right"` |  |
| `BottomLeft` | `"bottom-left"` |  |
| `BottomRight` | `"bottom-right"` |  |

