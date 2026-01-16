import type { RasterLayer, VectorLayer } from "@arcanvas/document";
import type { IRenderContext, TextureHandle } from "@arcanvas/core";

/**
 * Renderer for raster layers.
 * Converts raster layer content to texture.
 */
export class RasterLayerRenderer {
  /**
   * Render a raster layer to a texture.
   * For MVP, this extracts the image data from the layer's OffscreenCanvas.
   */
  renderToTexture(layer: RasterLayer, ctx: IRenderContext): TextureHandle | null {
    const surface = layer.getSurface();
    if (!surface) {
      return null;
    }

    // Get image data from OffscreenCanvas
    // Note: transferToImageBitmap() is the preferred method but may not be available in all browsers
    try {
      const imageBitmap = surface.transferToImageBitmap ? surface.transferToImageBitmap() : null;
      if (imageBitmap) {
        return ctx.createTexture(imageBitmap, layer.width, layer.height);
      }
    } catch (e) {
      // Fallback: create ImageBitmap from canvas using createImageBitmap
      // This requires async operation, so for MVP we'll return null and handle it differently
    }

    return null;
  }
}

/**
 * Renderer for vector layers.
 * For MVP, uses Canvas2D to render vector shapes to texture.
 * Can be upgraded to GPU rendering later.
 */
export class VectorLayerRenderer {
  /**
   * Render a vector layer to a texture.
   * For MVP, this creates a temporary canvas, draws the vector shapes, and converts to texture.
   */
  renderToTexture(layer: VectorLayer, ctx: IRenderContext): TextureHandle | null {
    // For MVP, vector layers are not yet fully implemented
    // This is a placeholder for Phase 3
    return null;
  }
}
