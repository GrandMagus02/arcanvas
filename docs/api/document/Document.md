# Constants

- [DocumentModel](#documentmodel)

## DocumentModel

Backward compatibility: export DocumentModel as alias for Document.

| Constant | Type |
| ---------- | ---------- |
| `DocumentModel` | `typeof Document` |


# Document

Document model representing a layered composition.
Renamed from DocumentModel to Document for clarity.

## Methods

- [addLayer](#addlayer)
- [removeLayer](#removelayer)
- [reorderLayer](#reorderlayer)
- [setLayerOpacity](#setlayeropacity)
- [setLayerBlendMode](#setlayerblendmode)
- [setLayerTransform](#setlayertransform)
- [setLayerVisible](#setlayervisible)
- [getLayerById](#getlayerbyid)
- [findLayer](#findlayer)
- [markDirty](#markdirty)
- [clearDirty](#cleardirty)
- [isDirty](#isdirty)

### addLayer

Add a layer to the document root.

| Method | Type |
| ---------- | ---------- |
| `addLayer` | `(layer: BaseLayer) => void` |

### removeLayer

Remove a layer by ID.

| Method | Type |
| ---------- | ---------- |
| `removeLayer` | `(layerId: string) => boolean` |

### reorderLayer

Reorder a layer to a new index within its parent.

| Method | Type |
| ---------- | ---------- |
| `reorderLayer` | `(layerId: string, newIndex: number) => boolean` |

### setLayerOpacity

Set layer opacity.

| Method | Type |
| ---------- | ---------- |
| `setLayerOpacity` | `(layerId: string, opacity: number) => boolean` |

### setLayerBlendMode

Set layer blend mode.

| Method | Type |
| ---------- | ---------- |
| `setLayerBlendMode` | `(layerId: string, blendMode: BlendMode) => boolean` |

### setLayerTransform

Set layer transform.

| Method | Type |
| ---------- | ---------- |
| `setLayerTransform` | `(layerId: string, transform: Transform2D) => boolean` |

### setLayerVisible

Set layer visibility.

| Method | Type |
| ---------- | ---------- |
| `setLayerVisible` | `(layerId: string, visible: boolean) => boolean` |

### getLayerById

Get layer by ID (searches recursively).

| Method | Type |
| ---------- | ---------- |
| `getLayerById` | `(layerId: string) => BaseLayer or null` |

### findLayer

Find layer by predicate (searches recursively).

| Method | Type |
| ---------- | ---------- |
| `findLayer` | `(predicate: (layer: BaseLayer) => boolean) => BaseLayer or null` |

### markDirty

Mark document as dirty.

| Method | Type |
| ---------- | ---------- |
| `markDirty` | `() => void` |

### clearDirty

Clear dirty flag.

| Method | Type |
| ---------- | ---------- |
| `clearDirty` | `() => void` |

### isDirty

Check if document is dirty.

| Method | Type |
| ---------- | ---------- |
| `isDirty` | `() => boolean` |

# Interfaces

- [DocumentEvents](#documentevents)
- [DocumentOptions](#documentoptions)

## DocumentEvents

Document event map.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `layerChanged` | `[layerId: string]` |  |
| `structureChanged` | `[]` |  |
| `documentMetadataChanged` | `[]` |  |


## DocumentOptions

Document options.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `width` | `number` |  |
| `height` | `number` |  |
| `colorProfile` | `string or undefined` |  |

