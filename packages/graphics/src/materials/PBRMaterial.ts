import type { BaseMaterial } from "./BaseMaterial";
import type { TextureRef } from "./types";

/**
 * Options for PBRMaterial.
 */
export interface PBRMaterialOptions {
  baseColor?: [number, number, number, number];
  metallic?: number;
  roughness?: number;
  metallicRoughnessTexture?: TextureRef | null;
  normalTexture?: TextureRef | null;
  doubleSided?: boolean;
  wireframe?: boolean;
  depthTest?: boolean;
  outline?: BaseMaterial["outline"];
}

/**
 * Physically-based rendering material.
 */
export class PBRMaterial implements BaseMaterial {
  readonly shadingModel = "pbr" as const;
  baseColor: [number, number, number, number];
  metallic: number;
  roughness: number;
  metallicRoughnessTexture?: TextureRef | null;
  normalTexture?: TextureRef | null;
  doubleSided?: boolean;
  wireframe?: boolean;
  depthTest?: boolean;
  outline?: BaseMaterial["outline"];

  constructor(options: PBRMaterialOptions = {}) {
    this.baseColor = options.baseColor ?? [1, 1, 1, 1];
    this.metallic = options.metallic ?? 0;
    this.roughness = options.roughness ?? 1;
    this.metallicRoughnessTexture = options.metallicRoughnessTexture ?? null;
    this.normalTexture = options.normalTexture ?? null;
    this.doubleSided = options.doubleSided;
    this.wireframe = options.wireframe;
    this.depthTest = options.depthTest ?? true;
    this.outline = options.outline;
  }
}
