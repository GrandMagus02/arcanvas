import { Document, type DocumentOptions } from "./Document";
import { GroupLayer, RasterLayer } from "./Layer";

/**
 * Create a new document.
 */
export function createDocument(width: number, height: number, options?: Partial<DocumentOptions>): Document {
  return new Document({
    width,
    height,
    ...options,
  });
}

/**
 * Create a raster layer.
 */
export function createRasterLayer(doc: Document, options?: { name?: string; width?: number; height?: number }): RasterLayer {
  const width = options?.width ?? doc.width;
  const height = options?.height ?? doc.height;
  const layer = new RasterLayer(width, height);
  if (options?.name) {
    layer.name = options.name;
  }
  return layer;
}

/**
 * Create a group layer.
 */
export function createGroupLayer(doc: Document, options?: { name?: string }): GroupLayer {
  const layer = new GroupLayer();
  if (options?.name) {
    layer.name = options.name;
  }
  return layer;
}
