import { RasterLayer } from "../document/Layer";

/**
 * Import an image into a raster layer.
 */
export async function importImageToRaster(url: string): Promise<RasterLayer> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");
  ctx.drawImage(img, 0, 0);
  const layer = new RasterLayer(canvas.width, canvas.height);
  const target = layer.getSurface();
  if (target) {
    const tctx = target.getContext("2d");
    if (tctx) tctx.drawImage(canvas, 0, 0);
  }
  return layer;
}

/**
 * Export a document to an image.
 */
export function exportDocumentToImage(docCanvas: HTMLCanvasElement): string {
  // Returns data URL (PNG)
  return docCanvas.toDataURL("image/png");
}
