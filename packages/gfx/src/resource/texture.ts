/**
 * @arcanvas/gfx - Texture resource
 *
 * GPU texture for image data, render targets, and storage.
 */

import type { TextureFormat } from "../types/formats.js";
import type { TextureUsageFlags } from "../types/usages.js";

// ============================================================================
// Texture Types
// ============================================================================

/**
 * Texture dimension type.
 */
export type TextureDimension = "1d" | "2d" | "3d";

/**
 * Texture view dimension type.
 */
export type TextureViewDimension = "1d" | "2d" | "2d-array" | "cube" | "cube-array" | "3d";

/**
 * Texture aspect for views.
 */
export type TextureAspect = "all" | "stencil-only" | "depth-only";

// ============================================================================
// Texture Descriptor
// ============================================================================

/**
 * Size of a texture.
 */
export interface GfxExtent3D {
  /** Width in texels */
  width: number;
  /** Height in texels (default: 1) */
  height?: number;
  /** Depth or array layer count (default: 1) */
  depthOrArrayLayers?: number;
}

/**
 * Descriptor for creating a GPU texture.
 */
export interface GfxTextureDescriptor {
  /** Debug label */
  label?: string;
  /** Texture size */
  size: GfxExtent3D;
  /** Mip level count (default: 1) */
  mipLevelCount?: number;
  /** Sample count for MSAA (default: 1) */
  sampleCount?: number;
  /** Texture dimension */
  dimension?: TextureDimension;
  /** Texture format */
  format: TextureFormat;
  /** Usage flags */
  usage: TextureUsageFlags;
  /** Allowed view formats (for format reinterpretation) */
  viewFormats?: TextureFormat[];
}

// ============================================================================
// Texture View Descriptor
// ============================================================================

/**
 * Descriptor for creating a texture view.
 */
export interface GfxTextureViewDescriptor {
  /** Debug label */
  label?: string;
  /** View format (default: texture's format) */
  format?: TextureFormat;
  /** View dimension (default: derived from texture) */
  dimension?: TextureViewDimension;
  /** Texture aspect to view */
  aspect?: TextureAspect;
  /** Base mip level (default: 0) */
  baseMipLevel?: number;
  /** Number of mip levels (default: all remaining) */
  mipLevelCount?: number;
  /** Base array layer (default: 0) */
  baseArrayLayer?: number;
  /** Number of array layers (default: all remaining) */
  arrayLayerCount?: number;
}

// ============================================================================
// Texture Interface
// ============================================================================

/**
 * Opaque GPU texture handle.
 */
export interface GfxTexture {
  /** Debug label */
  readonly label: string | undefined;
  /** Texture width */
  readonly width: number;
  /** Texture height */
  readonly height: number;
  /** Depth or array layer count */
  readonly depthOrArrayLayers: number;
  /** Mip level count */
  readonly mipLevelCount: number;
  /** Sample count */
  readonly sampleCount: number;
  /** Texture dimension */
  readonly dimension: TextureDimension;
  /** Texture format */
  readonly format: TextureFormat;
  /** Usage flags */
  readonly usage: TextureUsageFlags;

  /**
   * Create a view of this texture.
   */
  createView(descriptor?: GfxTextureViewDescriptor): GfxTextureView;

  /**
   * Destroy the texture and release GPU resources.
   */
  destroy(): void;
}

/**
 * Opaque GPU texture view handle.
 */
export interface GfxTextureView {
  /** Debug label */
  readonly label: string | undefined;
  /** The texture this view is from */
  readonly texture: GfxTexture;
}

// ============================================================================
// Texture Write Operation
// ============================================================================

/**
 * Image data layout for texture writes.
 */
export interface GfxImageDataLayout {
  /** Byte offset in the source data */
  offset?: number;
  /** Bytes per row (must be multiple of 256 for copies) */
  bytesPerRow?: number;
  /** Rows per image (for 3D/array textures) */
  rowsPerImage?: number;
}

/**
 * Copy destination for texture writes.
 */
export interface GfxImageCopyTexture {
  /** Target texture */
  texture: GfxTexture;
  /** Mip level to write to */
  mipLevel?: number;
  /** Origin in texels */
  origin?: { x?: number; y?: number; z?: number };
  /** Aspect to write */
  aspect?: TextureAspect;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Calculate the number of mip levels for a texture size.
 */
export function calculateMipLevelCount(width: number, height: number = 1, depth: number = 1): number {
  const maxDimension = Math.max(width, height, depth);
  return Math.floor(Math.log2(maxDimension)) + 1;
}

/**
 * Calculate the size of a mip level.
 */
export function getMipLevelSize(baseSize: number, mipLevel: number): number {
  return Math.max(1, Math.floor(baseSize / Math.pow(2, mipLevel)));
}

/**
 * Normalize extent to full 3D.
 */
export function normalizeExtent(extent: GfxExtent3D): Required<GfxExtent3D> {
  return {
    width: extent.width,
    height: extent.height ?? 1,
    depthOrArrayLayers: extent.depthOrArrayLayers ?? 1,
  };
}
