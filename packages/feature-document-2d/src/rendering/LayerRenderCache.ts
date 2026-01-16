import type { BaseLayer, RasterLayer } from "@arcanvas/document";
import type { IRenderContext, TextureHandle } from "@arcanvas/core";
import type { TextureRef } from "@arcanvas/graphics";

/**
 * Manages texture cache for document layers.
 * Tracks which layers have been rendered to textures and invalidates on changes.
 */
export class LayerRenderCache {
  private textureCache = new Map<string, TextureHandle>();
  private textureRefCache = new Map<string, TextureRef>();
  private dirtyLayers = new Set<string>();

  /**
   * Get the texture handle for a layer, or null if not cached.
   */
  getTexture(layer: BaseLayer): TextureHandle | null {
    return this.textureCache.get(layer.id) ?? null;
  }

  /**
   * Get the texture reference for a layer, or null if not cached.
   */
  getTextureRef(layer: BaseLayer): TextureRef | null {
    return this.textureRefCache.get(layer.id) ?? null;
  }

  /**
   * Invalidate a layer's cached texture.
   */
  invalidate(layer: BaseLayer): void {
    this.dirtyLayers.add(layer.id);
    const handle = this.textureCache.get(layer.id);
    if (handle) {
      // Texture will be deleted when replaced
      this.textureCache.delete(layer.id);
      this.textureRefCache.delete(layer.id);
    }
  }

  /**
   * Check if a layer is dirty and needs re-rendering.
   */
  isDirty(layer: BaseLayer): boolean {
    return this.dirtyLayers.has(layer.id) || layer.isDirty();
  }

  /**
   * Update the texture for a raster layer.
   * Creates or updates the texture from the layer's surface.
   */
  updateLayerTexture(layer: RasterLayer, ctx: IRenderContext): TextureHandle | null {
    if (!layer.isDirty() && !this.dirtyLayers.has(layer.id)) {
      // Return existing texture if not dirty
      return this.getTexture(layer);
    }

    const surface = layer.getSurface();
    if (!surface) {
      return null;
    }

    // Get image data from OffscreenCanvas
    // Use the helper method that disables image smoothing for pixel-perfect rendering
    const ctx2d = layer.getContext2D();
    if (!ctx2d) {
      return null;
    }

    // Get ImageData from the canvas
    const imageData = ctx2d.getImageData(0, 0, layer.width, layer.height);

    // Convert ImageData to Uint8Array (RGBA format)
    const rgbaData = new Uint8Array(imageData.data);

    // Delete old texture if it exists
    const oldHandle = this.textureCache.get(layer.id);
    if (oldHandle) {
      ctx.deleteTexture(oldHandle);
    }

    // Create new texture from RGBA data with pixelated=true for crisp rendering
    const textureHandle = ctx.createTexture(rgbaData, layer.width, layer.height, "rgba8", true);

    // Cache the texture
    this.textureCache.set(layer.id, textureHandle);
    this.textureRefCache.set(layer.id, {
      source: textureHandle as unknown as WebGLTexture, // Store the WebGLTexture handle
      width: layer.width,
      height: layer.height,
      format: "rgba8",
    });

    // Clear dirty flag
    this.dirtyLayers.delete(layer.id);
    layer.clearDirty();

    return textureHandle;
  }

  /**
   * Clear all cached textures.
   */
  clear(ctx: IRenderContext): void {
    for (const handle of this.textureCache.values()) {
      ctx.deleteTexture(handle);
    }
    this.textureCache.clear();
    this.textureRefCache.clear();
    this.dirtyLayers.clear();
  }
}
