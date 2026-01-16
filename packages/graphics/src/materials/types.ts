/**
 * Shading model type.
 */
export type ShadingModel = "unlit" | "phong" | "pbr" | "grid";

/**
 * Reference to a texture source.
 */
export interface TextureRef {
  source: HTMLImageElement | ImageBitmap | Uint8Array | Record<string, unknown>;
  width: number;
  height: number;
  format: "rgba8" | "rgb8" | "rg8";
}
