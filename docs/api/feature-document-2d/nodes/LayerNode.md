# LayerNode

Scene node that represents a document layer.
Bridges a document layer to the scene graph for rendering.

## Methods

- [syncFromLayer](#syncfromlayer)

### syncFromLayer

Updates material when layer properties change.

| Method | Type |
| ---------- | ---------- |
| `syncFromLayer` | `(document: Document) => void` |

## Properties

- [layerId](#layerid)
- [mesh](#mesh)
- [material](#material)
- [transform](#transform)

### layerId

| Property | Type |
| ---------- | ---------- |
| `layerId` | `string` |

### mesh

| Property | Type |
| ---------- | ---------- |
| `mesh` | `Mesh` |

### material

| Property | Type |
| ---------- | ---------- |
| `material` | `LayerMaterial` |

### transform

| Property | Type |
| ---------- | ---------- |
| `transform` | `Transform` |
