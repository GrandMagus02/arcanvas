# Functions

- [createPositionLayout](#createpositionlayout)
- [createPositionNormalLayout](#createpositionnormallayout)
- [createPositionNormalUVLayout](#createpositionnormaluvlayout)

## createPositionLayout

Creates a vertex layout with only position attribute.

| Function | Type |
| ---------- | ---------- |
| `createPositionLayout` | `(components?: 2 or 3) => VertexLayout` |

Parameters:

* `components`: - Number of position components (2 or 3)


## createPositionNormalLayout

Creates a vertex layout with position and normal attributes.

| Function | Type |
| ---------- | ---------- |
| `createPositionNormalLayout` | `() => VertexLayout` |

## createPositionNormalUVLayout

Creates a vertex layout with position, normal, and UV attributes.

| Function | Type |
| ---------- | ---------- |
| `createPositionNormalUVLayout` | `() => VertexLayout` |



# Interfaces

- [VertexAttributeDesc](#vertexattributedesc)
- [VertexLayout](#vertexlayout)

## VertexAttributeDesc

Description of a single vertex attribute.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `semantic` | `VertexAttributeSemantic` |  |
| `components` | `2 or 3 or 4` |  |
| `type` | `"float" or "uint8" or "uint16"` |  |
| `normalized` | `boolean` |  |
| `offset` | `number` |  |


## VertexLayout

Description of vertex data layout.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `stride` | `number` |  |
| `attributes` | `VertexAttributeDesc[]` |  |


# Types

- [VertexAttributeSemantic](#vertexattributesemantic)

## VertexAttributeSemantic

Semantic meaning of a vertex attribute.

| Type | Type |
| ---------- | ---------- |
| `VertexAttributeSemantic` | `position" or "normal" or "uv" or "color" or "tangent` |

