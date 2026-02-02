
# Interfaces

- [ISelectable](#iselectable)
- [BoundingBox](#boundingbox)

## ISelectable

Interface for objects that can be selected.
Objects implementing this interface can be managed by SelectionManager.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `id` | `string` | Unique identifier for the selectable object. |


## BoundingBox

Bounding box interface for dimension-agnostic bounds.
Dimension-specific implementations (BoundingBox2D, BoundingBox3D) should extend this.

| Property | Type | Description |
| ---------- | ---------- | ---------- |

