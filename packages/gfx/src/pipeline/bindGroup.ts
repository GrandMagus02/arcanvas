/**
 * @arcanvas/gfx - Bind group and layout
 *
 * WebGPU-style resource binding model.
 */

import type { ShaderStageFlags } from "../types/usages.js";
import type { TextureFormat } from "../types/formats.js";
import type { GfxBuffer } from "../resource/buffer.js";
import type { GfxSampler } from "../resource/sampler.js";
import type { GfxTextureView, TextureViewDimension } from "../resource/texture.js";

// ============================================================================
// Bind Group Layout Entry Types
// ============================================================================

/**
 * Buffer binding layout.
 */
export interface BufferBindingLayout {
  /** Binding type */
  type?: "uniform" | "storage" | "read-only-storage";
  /** Has dynamic offset */
  hasDynamicOffset?: boolean;
  /** Minimum buffer binding size (0 = no minimum) */
  minBindingSize?: number;
}

/**
 * Sampler binding layout.
 */
export interface SamplerBindingLayout {
  /** Sampler type */
  type?: "filtering" | "non-filtering" | "comparison";
}

/**
 * Texture sample type.
 */
export type TextureSampleType = "float" | "unfilterable-float" | "depth" | "sint" | "uint";

/**
 * Texture binding layout.
 */
export interface TextureBindingLayout {
  /** Sample type */
  sampleType?: TextureSampleType;
  /** View dimension */
  viewDimension?: TextureViewDimension;
  /** Is multisampled */
  multisampled?: boolean;
}

/**
 * Storage texture access mode.
 */
export type StorageTextureAccess = "write-only" | "read-only" | "read-write";

/**
 * Storage texture binding layout.
 */
export interface StorageTextureBindingLayout {
  /** Access mode */
  access?: StorageTextureAccess;
  /** Texture format */
  format: TextureFormat;
  /** View dimension */
  viewDimension?: TextureViewDimension;
}

/**
 * External texture binding layout (for video).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExternalTextureBindingLayout {
  // Reserved for future use
}

// ============================================================================
// Bind Group Layout Descriptor
// ============================================================================

/**
 * Single entry in a bind group layout.
 */
export interface GfxBindGroupLayoutEntry {
  /** Binding index */
  binding: number;
  /** Shader stage visibility */
  visibility: ShaderStageFlags;
  /** Buffer binding (mutually exclusive with other types) */
  buffer?: BufferBindingLayout;
  /** Sampler binding */
  sampler?: SamplerBindingLayout;
  /** Texture binding */
  texture?: TextureBindingLayout;
  /** Storage texture binding */
  storageTexture?: StorageTextureBindingLayout;
  /** External texture binding */
  externalTexture?: ExternalTextureBindingLayout;
}

/**
 * Descriptor for creating a bind group layout.
 */
export interface GfxBindGroupLayoutDescriptor {
  /** Debug label */
  label?: string;
  /** Layout entries */
  entries: GfxBindGroupLayoutEntry[];
}

// ============================================================================
// Bind Group Layout Interface
// ============================================================================

/**
 * Opaque bind group layout handle.
 */
export interface GfxBindGroupLayout {
  /** Debug label */
  readonly label: string | undefined;
}

// ============================================================================
// Bind Group Descriptor
// ============================================================================

/**
 * Buffer binding in a bind group.
 */
export interface GfxBufferBinding {
  /** Buffer to bind */
  buffer: GfxBuffer;
  /** Byte offset (default: 0) */
  offset?: number;
  /** Byte size (default: entire buffer from offset) */
  size?: number;
}

/**
 * Single entry in a bind group.
 */
export interface GfxBindGroupEntry {
  /** Binding index (must match layout) */
  binding: number;
  /** Resource to bind - one of: buffer binding, sampler, texture view */
  resource: GfxBufferBinding | GfxSampler | GfxTextureView;
}

/**
 * Descriptor for creating a bind group.
 */
export interface GfxBindGroupDescriptor {
  /** Debug label */
  label?: string;
  /** Layout this bind group conforms to */
  layout: GfxBindGroupLayout;
  /** Entries */
  entries: GfxBindGroupEntry[];
}

// ============================================================================
// Bind Group Interface
// ============================================================================

/**
 * Opaque bind group handle.
 */
export interface GfxBindGroup {
  /** Debug label */
  readonly label: string | undefined;
  /** Layout this bind group was created with */
  readonly layout: GfxBindGroupLayout;
}

// ============================================================================
// Pipeline Layout
// ============================================================================

/**
 * Descriptor for creating a pipeline layout.
 */
export interface GfxPipelineLayoutDescriptor {
  /** Debug label */
  label?: string;
  /** Bind group layouts (by group index) */
  bindGroupLayouts: GfxBindGroupLayout[];
}

/**
 * Opaque pipeline layout handle.
 */
export interface GfxPipelineLayout {
  /** Debug label */
  readonly label: string | undefined;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if a bind group entry is a buffer binding.
 */
export function isBufferBinding(resource: GfxBindGroupEntry["resource"]): resource is GfxBufferBinding {
  return "buffer" in resource;
}

/**
 * Create a simple uniform buffer layout entry.
 */
export function uniformBufferLayout(binding: number, visibility: ShaderStageFlags, minBindingSize?: number): GfxBindGroupLayoutEntry {
  return {
    binding,
    visibility,
    buffer: { type: "uniform", minBindingSize },
  };
}

/**
 * Create a simple storage buffer layout entry.
 */
export function storageBufferLayout(binding: number, visibility: ShaderStageFlags, readOnly: boolean = false): GfxBindGroupLayoutEntry {
  return {
    binding,
    visibility,
    buffer: { type: readOnly ? "read-only-storage" : "storage" },
  };
}

/**
 * Create a simple sampler layout entry.
 */
export function samplerLayout(binding: number, visibility: ShaderStageFlags, comparison: boolean = false): GfxBindGroupLayoutEntry {
  return {
    binding,
    visibility,
    sampler: { type: comparison ? "comparison" : "filtering" },
  };
}

/**
 * Create a simple texture layout entry.
 */
export function textureLayout(binding: number, visibility: ShaderStageFlags, sampleType: TextureSampleType = "float", viewDimension: TextureViewDimension = "2d"): GfxBindGroupLayoutEntry {
  return {
    binding,
    visibility,
    texture: { sampleType, viewDimension },
  };
}
