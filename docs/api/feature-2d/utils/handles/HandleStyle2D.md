# HandleStyle2D

Base class for 2D handle styles.
Provides common functionality for creating handles from bounding boxes.

## Methods

- [createHandles](#createhandles)

### createHandles

Creates a set of handles for a given bounding box.

| Method | Type |
| ---------- | ---------- |
| `createHandles` | `(bounds: BoundingBox) => HandleSet` |

## Properties

- [handleSize](#handlesize)
- [edgeHandleOffset](#edgehandleoffset)
- [rotationHandleOffset](#rotationhandleoffset)

### handleSize

Size of handles in pixels.

| Property | Type |
| ---------- | ---------- |
| `handleSize` | `number` |

### edgeHandleOffset

Distance from bounding box edge for edge handles (in world units).

| Property | Type |
| ---------- | ---------- |
| `edgeHandleOffset` | `number` |

### rotationHandleOffset

Distance above bounding box for rotation handle (in world units).

| Property | Type |
| ---------- | ---------- |
| `rotationHandleOffset` | `number` |
