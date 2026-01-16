# Functions

- [createPositionLayout](#createpositionlayout)

## createPositionLayout

Creates a vertex layout with only position attribute.

| Function | Type |
| ---------- | ---------- |
| `createPositionLayout` | `(components?: 2 or 3) => VertexLayout` |

Parameters:

* `components`: - Number of position components (2 or 3)


Returns:

Vertex layout configuration



# Interfaces

- [VertexAttributeDesc](#vertexattributedesc)
- [VertexLayout](#vertexlayout)

## VertexAttributeDesc



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `semantic` | `VertexAttributeSemantic` |  |
| `components` | `2 or 3 or 4` |  |
| `type` | `"float" or "uint8" or "uint16"` |  |
| `normalized` | `boolean` |  |
| `offset` | `number` |  |


## VertexLayout



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `stride` | `number` |  |
| `attributes` | `VertexAttributeDesc[]` |  |


# Types

- [VertexAttributeSemantic](#vertexattributesemantic)

## VertexAttributeSemantic

| Type | Type |
| ---------- | ---------- |
| `VertexAttributeSemantic` | `position" or "normal" or "uv" or "color" or "tangent` |

