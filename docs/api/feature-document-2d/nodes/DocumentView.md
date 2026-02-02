# DocumentView

Root view for document rendering (bridges Document to Scene).
Manages layer nodes and syncs them with document layers.

## Methods

- [syncLayers](#synclayers)
- [onDocumentChanged](#ondocumentchanged)
- [getRenderCache](#getrendercache)
- [updateTextures](#updatetextures)

### syncLayers

Syncs layer nodes with document layers.

| Method | Type |
| ---------- | ---------- |
| `syncLayers` | `() => void` |

### onDocumentChanged

Handles document events and updates rendering.

| Method | Type |
| ---------- | ---------- |
| `onDocumentChanged` | `() => void` |

### getRenderCache

Get the render cache.

| Method | Type |
| ---------- | ---------- |
| `getRenderCache` | `() => LayerRenderCache` |

### updateTextures

Update textures for all dirty layers.
Should be called before rendering each frame.

| Method | Type |
| ---------- | ---------- |
| `updateTextures` | `(renderContext: IRenderContext) => void` |

## Properties

- [document](#document)
- [layerNodes](#layernodes)
- [renderCache](#rendercache)

### document

| Property | Type |
| ---------- | ---------- |
| `document` | `Document` |

### layerNodes

| Property | Type |
| ---------- | ---------- |
| `layerNodes` | `Map<string, LayerNode>` |

### renderCache

| Property | Type |
| ---------- | ---------- |
| `renderCache` | `LayerRenderCache` |
