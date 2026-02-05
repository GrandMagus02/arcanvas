/**
 * @arcanvas/gfx - Sampler resource
 *
 * GPU sampler for texture filtering and addressing.
 */

import type { CompareFunction } from "../types/states.js";

// ============================================================================
// Sampler Types
// ============================================================================

/**
 * Texture filtering mode.
 */
export type FilterMode = "nearest" | "linear";

/**
 * Mipmap filtering mode.
 */
export type MipmapFilterMode = "nearest" | "linear";

/**
 * Texture address/wrap mode.
 */
export type AddressMode = "clamp-to-edge" | "repeat" | "mirror-repeat";

// ============================================================================
// Sampler Descriptor
// ============================================================================

/**
 * Descriptor for creating a GPU sampler.
 */
export interface GfxSamplerDescriptor {
  /** Debug label */
  label?: string;

  // Filtering
  /** Magnification filter (default: nearest) */
  magFilter?: FilterMode;
  /** Minification filter (default: nearest) */
  minFilter?: FilterMode;
  /** Mipmap filter (default: nearest) */
  mipmapFilter?: MipmapFilterMode;

  // Addressing
  /** U (horizontal) address mode (default: clamp-to-edge) */
  addressModeU?: AddressMode;
  /** V (vertical) address mode (default: clamp-to-edge) */
  addressModeV?: AddressMode;
  /** W (depth) address mode (default: clamp-to-edge) */
  addressModeW?: AddressMode;

  // LOD
  /** Minimum LOD clamp (default: 0) */
  lodMinClamp?: number;
  /** Maximum LOD clamp (default: 32) */
  lodMaxClamp?: number;

  // Comparison (for shadow sampling)
  /** Enable comparison mode */
  compare?: CompareFunction;

  // Anisotropy
  /** Maximum anisotropy (default: 1, max typically 16) */
  maxAnisotropy?: number;
}

// ============================================================================
// Sampler Interface
// ============================================================================

/**
 * Opaque GPU sampler handle.
 */
export interface GfxSampler {
  /** Debug label */
  readonly label: string | undefined;
}

// ============================================================================
// Common Sampler Presets
// ============================================================================

/**
 * Common sampler configurations.
 */
export const SamplerPresets = {
  /** Nearest neighbor, clamp to edge */
  NEAREST_CLAMP: {
    magFilter: "nearest",
    minFilter: "nearest",
    mipmapFilter: "nearest",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  } satisfies GfxSamplerDescriptor,

  /** Linear filtering, clamp to edge */
  LINEAR_CLAMP: {
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  } satisfies GfxSamplerDescriptor,

  /** Linear filtering, repeat */
  LINEAR_REPEAT: {
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "repeat",
    addressModeV: "repeat",
  } satisfies GfxSamplerDescriptor,

  /** Linear filtering with anisotropic filtering */
  LINEAR_ANISO: {
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: "repeat",
    addressModeV: "repeat",
    maxAnisotropy: 16,
  } satisfies GfxSamplerDescriptor,

  /** Shadow map comparison sampler */
  SHADOW: {
    magFilter: "linear",
    minFilter: "linear",
    compare: "less",
    addressModeU: "clamp-to-edge",
    addressModeV: "clamp-to-edge",
  } satisfies GfxSamplerDescriptor,
} as const;
