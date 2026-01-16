/**
 * Abstract reference to raster image data (API-agnostic).
 * Can represent CPU buffer, GPU texture handle, file reference, etc.
 */
export interface RasterSourceRef {
  id: string;
  width: number;
  height: number;
  // Can be: CPU buffer, GPU texture handle, file reference
  source: ImageBitmap | HTMLImageElement | OffscreenCanvas | string;
}
