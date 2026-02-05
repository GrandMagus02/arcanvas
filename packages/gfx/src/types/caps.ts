/**
 * @arcanvas/gfx - Device capabilities and limits
 *
 * Backend-agnostic capability reporting for feature detection.
 */

import type { TextureFormat } from "./formats.js";

// ============================================================================
// Device Features
// ============================================================================

/**
 * Optional GPU features that may not be available on all backends/devices.
 */
export type GfxFeature =
  // Texture compression
  | "texture-compression-bc"
  | "texture-compression-etc2"
  | "texture-compression-astc"
  // Depth formats
  | "depth-clip-control"
  | "depth32float-stencil8"
  // Shader features
  | "shader-f16"
  | "shader-i16"
  // Storage features
  | "bgra8unorm-storage"
  | "rg11b10ufloat-renderable"
  // Timing
  | "timestamp-query"
  // Indirect rendering
  | "indirect-first-instance"
  // Float32 filtering
  | "float32-filterable"
  // Subgroups (compute)
  | "subgroups"
  // Dual-source blending
  | "dual-source-blending"
  // Storage textures
  | "readonly-storage-texture"
  | "readwrite-storage-texture"
  // WebGL2-only limitations (inverted: not present = limited)
  | "storage-buffers"
  | "compute-shaders";

// ============================================================================
// Device Limits
// ============================================================================

/**
 * Numeric limits of the GPU device.
 */
export interface GfxLimits {
  // Texture limits
  readonly maxTextureDimension1D: number;
  readonly maxTextureDimension2D: number;
  readonly maxTextureDimension3D: number;
  readonly maxTextureArrayLayers: number;

  // Bind group limits
  readonly maxBindGroups: number;
  readonly maxBindGroupsPlusVertexBuffers: number;
  readonly maxBindingsPerBindGroup: number;
  readonly maxDynamicUniformBuffersPerPipelineLayout: number;
  readonly maxDynamicStorageBuffersPerPipelineLayout: number;
  readonly maxSampledTexturesPerShaderStage: number;
  readonly maxSamplersPerShaderStage: number;
  readonly maxStorageBuffersPerShaderStage: number;
  readonly maxStorageTexturesPerShaderStage: number;
  readonly maxUniformBuffersPerShaderStage: number;

  // Buffer limits
  readonly maxUniformBufferBindingSize: number;
  readonly maxStorageBufferBindingSize: number;
  readonly minUniformBufferOffsetAlignment: number;
  readonly minStorageBufferOffsetAlignment: number;

  // Vertex limits
  readonly maxVertexBuffers: number;
  readonly maxBufferSize: number;
  readonly maxVertexAttributes: number;
  readonly maxVertexBufferArrayStride: number;

  // Inter-stage limits
  readonly maxInterStageShaderComponents: number;
  readonly maxInterStageShaderVariables: number;

  // Color attachment limits
  readonly maxColorAttachments: number;
  readonly maxColorAttachmentBytesPerSample: number;

  // Compute limits (0 if compute not supported)
  readonly maxComputeWorkgroupStorageSize: number;
  readonly maxComputeInvocationsPerWorkgroup: number;
  readonly maxComputeWorkgroupSizeX: number;
  readonly maxComputeWorkgroupSizeY: number;
  readonly maxComputeWorkgroupSizeZ: number;
  readonly maxComputeWorkgroupsPerDimension: number;
}

/**
 * Default limits that work on most WebGL2 devices.
 * Use for portable applications.
 */
export const DEFAULT_LIMITS: GfxLimits = {
  maxTextureDimension1D: 8192,
  maxTextureDimension2D: 8192,
  maxTextureDimension3D: 2048,
  maxTextureArrayLayers: 256,

  maxBindGroups: 4,
  maxBindGroupsPlusVertexBuffers: 24,
  maxBindingsPerBindGroup: 1000,
  maxDynamicUniformBuffersPerPipelineLayout: 8,
  maxDynamicStorageBuffersPerPipelineLayout: 4,
  maxSampledTexturesPerShaderStage: 16,
  maxSamplersPerShaderStage: 16,
  maxStorageBuffersPerShaderStage: 8,
  maxStorageTexturesPerShaderStage: 4,
  maxUniformBuffersPerShaderStage: 12,

  maxUniformBufferBindingSize: 65536,
  maxStorageBufferBindingSize: 134217728,
  minUniformBufferOffsetAlignment: 256,
  minStorageBufferOffsetAlignment: 256,

  maxVertexBuffers: 8,
  maxBufferSize: 268435456,
  maxVertexAttributes: 16,
  maxVertexBufferArrayStride: 2048,

  maxInterStageShaderComponents: 60,
  maxInterStageShaderVariables: 16,

  maxColorAttachments: 8,
  maxColorAttachmentBytesPerSample: 32,

  maxComputeWorkgroupStorageSize: 16384,
  maxComputeInvocationsPerWorkgroup: 256,
  maxComputeWorkgroupSizeX: 256,
  maxComputeWorkgroupSizeY: 256,
  maxComputeWorkgroupSizeZ: 64,
  maxComputeWorkgroupsPerDimension: 65535,
};

// ============================================================================
// Format Capabilities
// ============================================================================

/**
 * Capability flags for a texture format.
 */
export interface FormatCapabilities {
  /** Format can be sampled with filtering */
  readonly filterable: boolean;
  /** Format can be used as storage texture */
  readonly storage: boolean;
  /** Format can be used as render target */
  readonly renderable: boolean;
  /** Format can be blended when rendering */
  readonly blendable: boolean;
  /** Format can be used for MSAA */
  readonly multisample: boolean;
  /** Format can be resolved (MSAA resolve) */
  readonly resolvable: boolean;
}

// ============================================================================
// Device Capabilities
// ============================================================================

/**
 * Full device capabilities report.
 */
export interface GfxCapabilities {
  /** Backend identifier */
  readonly backendId: string;
  /** Backend version/info string */
  readonly backendInfo: string;
  /** Device/adapter name */
  readonly deviceName: string;

  /** Supported optional features */
  readonly features: ReadonlySet<GfxFeature>;
  /** Device numeric limits */
  readonly limits: GfxLimits;

  /**
   * Query capabilities of a texture format.
   * Returns null if format is not supported at all.
   */
  getFormatCapabilities(format: TextureFormat): FormatCapabilities | null;

  /** Check if a feature is supported */
  hasFeature(feature: GfxFeature): boolean;
}

/**
 * Create a capabilities checker from a feature set.
 */
export function createCapabilitiesChecker(features: ReadonlySet<GfxFeature>): Pick<GfxCapabilities, "hasFeature"> {
  return {
    hasFeature(feature: GfxFeature): boolean {
      return features.has(feature);
    },
  };
}
