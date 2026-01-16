import type { Builder } from "@arcanvas/core";
import type { BaseMaterial } from "./BaseMaterial";
import { PBRMaterial, type PBRMaterialOptions } from "./PBRMaterial";
import type { TextureRef } from "./types";
import { UnlitColorMaterial, type UnlitColorMaterialOptions } from "./UnlitColorMaterial";

/**
 * Options for MaterialBuilder.
 * Supports both unlit and PBR material properties.
 */
export interface MaterialBuilderOptions {
  // Unlit properties
  solid?: [number, number, number, number];
  baseColor?: [number, number, number, number];

  // PBR properties
  albedo?: TextureRef | null;
  baseColorTexture?: TextureRef | null;
  metallic?: number;
  roughness?: number;
  metallicRoughnessTexture?: TextureRef | null;
  normals?: TextureRef | null;
  normalTexture?: TextureRef | null;

  // Outline
  outline?: BaseMaterial["outline"];
  outlineColor?: [number, number, number, number];
  outlineThickness?: number;
  outlineWidth?: number;
  outlineScreenSpace?: boolean;

  // Common properties
  doubleSided?: boolean;
  wireframe?: boolean;
  receiveShadows?: boolean;
  castShadows?: boolean;
}

/**
 * Builder class for creating materials with a fluent API.
 *
 * @example
 * ```ts
 * // Fluent API
 * const material = new MaterialBuilder()
 *   .solid([1, 0, 0, 1])
 *   .outline([0, 0, 0, 1], 2)
 *   .build();
 *
 * // PBR material
 * const pbrMaterial = new MaterialBuilder()
 *   .albedo(texture)
 *   .normals(normalMap)
 *   .metallic(0.5)
 *   .roughness(0.3)
 *   .build();
 *
 * // Options-based
 * const material = new MaterialBuilder({
 *   solid: [1, 0, 0, 1],
 *   outlineColor: [0, 0, 0, 1],
 *   outlineWidth: 2
 * }).build();
 * ```
 */
export class MaterialBuilder implements Builder<BaseMaterial> {
  private options: MaterialBuilderOptions = {};

  constructor(options?: MaterialBuilderOptions) {
    if (options) {
      this.options = { ...options };
      // Handle outline from options object
      if (options.outlineColor || options.outlineThickness !== undefined || options.outlineWidth !== undefined) {
        this.options.outline = {
          color: options.outlineColor ?? options.outline?.color ?? [0, 0, 0, 1],
          thickness: options.outlineThickness ?? options.outlineWidth ?? options.outline?.thickness ?? 1,
          screenSpace: options.outlineScreenSpace ?? options.outline?.screenSpace ?? false,
        };
      } else if (options.outline) {
        this.options.outline = options.outline;
      }
    }
  }

  /**
   * Set the solid/base color for unlit materials.
   * Alias for baseColor.
   */
  solid(color: [number, number, number, number]): this {
    this.options.solid = color;
    this.options.baseColor = color;
    return this;
  }

  /**
   * Set the base color (works for both unlit and PBR).
   */
  baseColor(color: [number, number, number, number]): this {
    this.options.baseColor = color;
    if (!this.options.solid) {
      this.options.solid = color;
    }
    return this;
  }

  /**
   * Set the albedo/base color texture for PBR materials.
   * Alias for baseColorTexture.
   */
  albedo(texture: TextureRef | null): this {
    this.options.albedo = texture;
    this.options.baseColorTexture = texture;
    return this;
  }

  /**
   * Set the base color texture.
   */
  baseColorTexture(texture: TextureRef | null): this {
    this.options.baseColorTexture = texture;
    if (!this.options.albedo) {
      this.options.albedo = texture;
    }
    return this;
  }

  /**
   * Set the metallic value for PBR materials.
   */
  metallic(value: number): this {
    this.options.metallic = value;
    return this;
  }

  /**
   * Set the roughness value for PBR materials.
   */
  roughness(value: number): this {
    this.options.roughness = value;
    return this;
  }

  /**
   * Set the metallic-roughness texture for PBR materials.
   */
  metallicRoughness(texture: TextureRef | null): this {
    this.options.metallicRoughnessTexture = texture;
    return this;
  }

  /**
   * Set the normal map texture for PBR materials.
   * Alias for normalTexture.
   */
  normals(texture: TextureRef | null): this {
    this.options.normals = texture;
    this.options.normalTexture = texture;
    return this;
  }

  /**
   * Set the normal texture.
   */
  normalTexture(texture: TextureRef | null): this {
    this.options.normalTexture = texture;
    if (!this.options.normals) {
      this.options.normals = texture;
    }
    return this;
  }

  /**
   * Set the outline properties.
   * @param color - Outline color
   * @param thickness - Outline thickness (default: 1)
   * @param screenSpace - Whether outline is in screen space (default: false)
   */
  outline(color: [number, number, number, number], thickness?: number, screenSpace?: boolean): this {
    this.options.outline = {
      color,
      thickness: thickness ?? this.options.outline?.thickness ?? 1,
      screenSpace: screenSpace ?? this.options.outline?.screenSpace ?? false,
    };
    this.options.outlineColor = color;
    if (thickness !== undefined) {
      this.options.outlineThickness = thickness;
      this.options.outlineWidth = thickness;
    }
    if (screenSpace !== undefined) {
      this.options.outlineScreenSpace = screenSpace;
    }
    return this;
  }

  /**
   * Set outline color.
   */
  outlineColor(color: [number, number, number, number]): this {
    if (!this.options.outline) {
      this.options.outline = {
        color,
        thickness: this.options.outlineThickness ?? this.options.outlineWidth ?? 1,
        screenSpace: this.options.outlineScreenSpace ?? false,
      };
    } else {
      this.options.outline.color = color;
    }
    this.options.outlineColor = color;
    return this;
  }

  /**
   * Set outline thickness/width.
   */
  outlineWidth(thickness: number): this {
    if (!this.options.outline) {
      this.options.outline = {
        color: this.options.outlineColor ?? [0, 0, 0, 1],
        thickness,
        screenSpace: this.options.outlineScreenSpace ?? false,
      };
    } else {
      this.options.outline.thickness = thickness;
    }
    this.options.outlineThickness = thickness;
    this.options.outlineWidth = thickness;
    return this;
  }

  /**
   * Set whether outline is in screen space.
   */
  outlineScreenSpace(screenSpace: boolean): this {
    if (!this.options.outline) {
      this.options.outline = {
        color: this.options.outlineColor ?? [0, 0, 0, 1],
        thickness: this.options.outlineThickness ?? this.options.outlineWidth ?? 1,
        screenSpace,
      };
    } else {
      this.options.outline.screenSpace = screenSpace;
    }
    this.options.outlineScreenSpace = screenSpace;
    return this;
  }

  /**
   * Enable double-sided rendering.
   */
  doubleSided(enabled: boolean = true): this {
    this.options.doubleSided = enabled;
    return this;
  }

  /**
   * Enable wireframe rendering.
   */
  wireframe(enabled: boolean = true): this {
    this.options.wireframe = enabled;
    return this;
  }

  /**
   * Enable shadow receiving.
   */
  receiveShadows(enabled: boolean = true): this {
    this.options.receiveShadows = enabled;
    return this;
  }

  /**
   * Enable shadow casting.
   */
  castShadows(enabled: boolean = true): this {
    this.options.castShadows = enabled;
    return this;
  }

  /**
   * Build the material based on the configured options.
   * Returns a PBRMaterial if PBR properties are set, otherwise UnlitColorMaterial.
   */
  build(): BaseMaterial {
    const opts = this.options;

    // Determine if we should build a PBR material
    const isPBR =
      opts.metallic !== undefined ||
      opts.roughness !== undefined ||
      opts.metallicRoughnessTexture !== undefined ||
      opts.normalTexture !== undefined ||
      opts.normals !== undefined ||
      opts.baseColorTexture !== undefined ||
      opts.albedo !== undefined;

    if (isPBR) {
      const pbrOptions: PBRMaterialOptions = {
        baseColor: opts.baseColor ?? opts.solid ?? [1, 1, 1, 1],
        metallic: opts.metallic,
        roughness: opts.roughness,
        metallicRoughnessTexture: opts.metallicRoughnessTexture ?? null,
        normalTexture: opts.normalTexture ?? opts.normals ?? null,
        doubleSided: opts.doubleSided,
        wireframe: opts.wireframe,
        outline: opts.outline,
      };
      return new PBRMaterial(pbrOptions);
    } else {
      const unlitOptions: UnlitColorMaterialOptions = {
        baseColor: opts.baseColor ?? opts.solid ?? [1, 1, 1, 1],
        doubleSided: opts.doubleSided,
        wireframe: opts.wireframe,
        outline: opts.outline,
      };
      return new UnlitColorMaterial(unlitOptions);
    }
  }
}
