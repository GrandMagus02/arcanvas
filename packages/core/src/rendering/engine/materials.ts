/**
 *
 */
export type ShadingModel = "unlit" | "phong" | "pbr" | "grid";

/**
 *
 */
export interface TextureRef {
  source: HTMLImageElement | ImageBitmap | Uint8Array | Record<string, unknown>;
  width: number;
  height: number;
  format: "rgba8" | "rgb8" | "rg8";
}

/**
 *
 */
export interface BaseMaterial {
  readonly shadingModel: ShadingModel;
  baseColor?: [number, number, number, number];
  baseColorTexture?: TextureRef | null;
  metallic?: number;
  roughness?: number;
  metallicRoughnessTexture?: TextureRef | null;
  normalTexture?: TextureRef | null;
  doubleSided?: boolean;
  wireframe?: boolean;
  receiveShadows?: boolean;
  castShadows?: boolean;
  outline?: {
    thickness: number;
    color: [number, number, number, number];
    screenSpace: boolean;
  };
  extra?: Record<string, unknown>;
}

/**
 *
 */
export interface UnlitColorMaterialOptions {
  baseColor?: [number, number, number, number];
  doubleSided?: boolean;
  wireframe?: boolean;
  outline?: BaseMaterial["outline"];
}

/**
 *
 */
export class UnlitColorMaterial implements BaseMaterial {
  readonly shadingModel = "unlit" as const;
  baseColor: [number, number, number, number];
  doubleSided?: boolean;
  wireframe?: boolean;
  outline?: BaseMaterial["outline"];

  constructor(options: UnlitColorMaterialOptions = {}) {
    this.baseColor = options.baseColor ?? [1, 1, 1, 1];
    this.doubleSided = options.doubleSided;
    this.wireframe = options.wireframe;
    this.outline = options.outline;
  }
}

/**
 *
 */
export interface PBRMaterialOptions {
  baseColor?: [number, number, number, number];
  metallic?: number;
  roughness?: number;
  metallicRoughnessTexture?: TextureRef | null;
  normalTexture?: TextureRef | null;
  doubleSided?: boolean;
  wireframe?: boolean;
  outline?: BaseMaterial["outline"];
}

/**
 *
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
  outline?: BaseMaterial["outline"];

  constructor(options: PBRMaterialOptions = {}) {
    this.baseColor = options.baseColor ?? [1, 1, 1, 1];
    this.metallic = options.metallic ?? 0;
    this.roughness = options.roughness ?? 1;
    this.metallicRoughnessTexture = options.metallicRoughnessTexture ?? null;
    this.normalTexture = options.normalTexture ?? null;
    this.doubleSided = options.doubleSided;
    this.wireframe = options.wireframe;
    this.outline = options.outline;
  }
}
