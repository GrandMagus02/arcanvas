import type { BaseMaterial } from "./BaseMaterial";

/**
 * Options for UnlitColorMaterial.
 */
export interface UnlitColorMaterialOptions {
  baseColor?: [number, number, number, number];
  doubleSided?: boolean;
  wireframe?: boolean;
  outline?: BaseMaterial["outline"];
}

/**
 * Simple unlit color material.
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
