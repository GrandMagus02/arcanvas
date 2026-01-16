import type { BaseMaterial } from "@arcanvas/graphics";
import type { TextureRef } from "@arcanvas/graphics";
import { BlendMode } from "@arcanvas/document";

/**
 * Material for rendering a document layer with blend mode and opacity support.
 */
export class LayerMaterial implements BaseMaterial {
  readonly shadingModel = "unlit" as const;
  baseColor?: [number, number, number, number];
  baseColorTexture?: TextureRef | null;
  opacity: number;
  blendMode: BlendMode;

  constructor(options: { texture?: TextureRef | null; opacity?: number; blendMode?: BlendMode }) {
    this.baseColorTexture = options.texture ?? null;
    this.opacity = options.opacity ?? 1;
    this.blendMode = options.blendMode ?? BlendMode.Normal;
    this.baseColor = [1, 1, 1, this.opacity];
  }

  /**
   * Update the texture.
   */
  setTexture(texture: TextureRef | null): void {
    this.baseColorTexture = texture;
  }

  /**
   * Update the opacity.
   */
  setOpacity(opacity: number): void {
    this.opacity = Math.max(0, Math.min(1, opacity));
    this.baseColor = [1, 1, 1, this.opacity];
  }

  /**
   * Update the blend mode.
   */
  setBlendMode(blendMode: BlendMode): void {
    this.blendMode = blendMode;
  }
}
