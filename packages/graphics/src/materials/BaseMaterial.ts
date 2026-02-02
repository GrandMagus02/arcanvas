import type { ShadingModel, TextureRef } from "./types";

/**
 * Base material interface.
 * All materials must implement this interface.
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
  depthTest?: boolean;
  receiveShadows?: boolean;
  castShadows?: boolean;
  outline?: {
    thickness: number;
    color: [number, number, number, number];
    screenSpace: boolean;
  };
  extra?: Record<string, unknown>;
}
