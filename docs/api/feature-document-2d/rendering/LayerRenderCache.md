# LayerRenderCache

Manages texture cache for document layers.
Tracks which layers have been rendered to textures and invalidates on changes.

## Methods

- [getTexture](#gettexture)
- [getTextureRef](#gettextureref)
- [invalidate](#invalidate)
- [isDirty](#isdirty)
- [updateLayerTexture](#updatelayertexture)
- [clear](#clear)

### getTexture

Get the texture handle for a layer, or null if not cached.

| Method | Type |
| ---------- | ---------- |
| `getTexture` | `(layer: BaseLayer) => TextureHandle` |

### getTextureRef

Get the texture reference for a layer, or null if not cached.

| Method | Type |
| ---------- | ---------- |
| `getTextureRef` | `(layer: BaseLayer) => TextureRef or null` |

### invalidate

Invalidate a layer's cached texture.

| Method | Type |
| ---------- | ---------- |
| `invalidate` | `(layer: BaseLayer) => void` |

### isDirty

Check if a layer is dirty and needs re-rendering.

| Method | Type |
| ---------- | ---------- |
| `isDirty` | `(layer: BaseLayer) => boolean` |

### updateLayerTexture

Update the texture for a raster layer.
Creates or updates the texture from the layer's surface.

| Method | Type |
| ---------- | ---------- |
| `updateLayerTexture` | `(layer: RasterLayer, ctx: IRenderContext) => TextureHandle` |

### clear

Clear all cached textures.

| Method | Type |
| ---------- | ---------- |
| `clear` | `(ctx: IRenderContext) => void` |
