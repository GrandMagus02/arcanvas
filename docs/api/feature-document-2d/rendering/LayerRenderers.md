# RasterLayerRenderer

Renderer for raster layers.
Converts raster layer content to texture.

## Methods

- [renderToTexture](#rendertotexture)

### renderToTexture

Render a raster layer to a texture.
For MVP, this extracts the image data from the layer's OffscreenCanvas.

| Method | Type |
| ---------- | ---------- |
| `renderToTexture` | `(layer: RasterLayer, ctx: IRenderContext) => TextureHandle` |

# VectorLayerRenderer

Renderer for vector layers.
For MVP, uses Canvas2D to render vector shapes to texture.
Can be upgraded to GPU rendering later.

## Methods

- [renderToTexture](#rendertotexture)

### renderToTexture

Render a vector layer to a texture.
For MVP, this creates a temporary canvas, draws the vector shapes, and converts to texture.

| Method | Type |
| ---------- | ---------- |
| `renderToTexture` | `(_layer: VectorLayer, _ctx: IRenderContext) => TextureHandle` |
