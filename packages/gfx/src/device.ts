/**
 * @arcanvas/gfx - GPU Device
 *
 * Main entry point for GPU resource creation and command submission.
 */

import type { GfxCapabilities, GfxFeature, GfxLimits } from "./types/caps.js";
import type { GfxErrorScope } from "./types/errors.js";
import type { GfxBuffer, GfxBufferDescriptor } from "./resource/buffer.js";
import type { GfxTexture, GfxTextureDescriptor } from "./resource/texture.js";
import type { GfxSampler, GfxSamplerDescriptor } from "./resource/sampler.js";
import type { GfxShaderModule, GfxShaderModuleDescriptor } from "./pipeline/shader.js";
import type { GfxBindGroupLayout, GfxBindGroupLayoutDescriptor, GfxBindGroup, GfxBindGroupDescriptor, GfxPipelineLayout, GfxPipelineLayoutDescriptor } from "./pipeline/bindGroup.js";
import type { GfxRenderPipeline, GfxRenderPipelineDescriptor } from "./pipeline/renderPipeline.js";
import type { GfxComputePipeline, GfxComputePipelineDescriptor } from "./pipeline/computePipeline.js";
import type { GfxCommandEncoder, GfxCommandEncoderDescriptor, GfxQueue } from "./command/encoder.js";

// ============================================================================
// Device Lost Info
// ============================================================================

/**
 * Reason for device loss.
 */
export type DeviceLostReason = "unknown" | "destroyed";

/**
 * Information about device loss.
 */
export interface GfxDeviceLostInfo {
  /** Reason for loss */
  readonly reason: DeviceLostReason;
  /** Human-readable message */
  readonly message: string;
}

// ============================================================================
// Device Interface
// ============================================================================

/**
 * GPU Device - the main interface for GPU operations.
 *
 * The device is used to create all GPU resources (buffers, textures, pipelines)
 * and command encoders. It also provides capability information and error handling.
 *
 * This interface follows WebGPU semantics but is backend-agnostic.
 */
export interface GfxDevice extends GfxErrorScope {
  /** Debug label */
  readonly label: string | undefined;

  /** Device capabilities */
  readonly capabilities: GfxCapabilities;

  /** Device limits */
  readonly limits: GfxLimits;

  /** Supported features */
  readonly features: ReadonlySet<GfxFeature>;

  /** Command queue */
  readonly queue: GfxQueue;

  /** Promise that resolves when device is lost */
  readonly lost: Promise<GfxDeviceLostInfo>;

  // ============================================================================
  // Resource Creation
  // ============================================================================

  /**
   * Create a GPU buffer.
   */
  createBuffer(descriptor: GfxBufferDescriptor): GfxBuffer;

  /**
   * Create a GPU texture.
   */
  createTexture(descriptor: GfxTextureDescriptor): GfxTexture;

  /**
   * Create a sampler.
   */
  createSampler(descriptor?: GfxSamplerDescriptor): GfxSampler;

  // ============================================================================
  // Shader/Pipeline Creation
  // ============================================================================

  /**
   * Create a shader module.
   */
  createShaderModule(descriptor: GfxShaderModuleDescriptor): GfxShaderModule;

  /**
   * Create a bind group layout.
   */
  createBindGroupLayout(descriptor: GfxBindGroupLayoutDescriptor): GfxBindGroupLayout;

  /**
   * Create a bind group.
   */
  createBindGroup(descriptor: GfxBindGroupDescriptor): GfxBindGroup;

  /**
   * Create a pipeline layout.
   */
  createPipelineLayout(descriptor: GfxPipelineLayoutDescriptor): GfxPipelineLayout;

  /**
   * Create a render pipeline synchronously.
   */
  createRenderPipeline(descriptor: GfxRenderPipelineDescriptor): GfxRenderPipeline;

  /**
   * Create a render pipeline asynchronously.
   * Allows shader compilation to happen in the background.
   */
  createRenderPipelineAsync(descriptor: GfxRenderPipelineDescriptor): Promise<GfxRenderPipeline>;

  /**
   * Create a compute pipeline synchronously.
   */
  createComputePipeline(descriptor: GfxComputePipelineDescriptor): GfxComputePipeline;

  /**
   * Create a compute pipeline asynchronously.
   */
  createComputePipelineAsync(descriptor: GfxComputePipelineDescriptor): Promise<GfxComputePipeline>;

  // ============================================================================
  // Command Encoding
  // ============================================================================

  /**
   * Create a command encoder.
   */
  createCommandEncoder(descriptor?: GfxCommandEncoderDescriptor): GfxCommandEncoder;

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Destroy the device and release all resources.
   */
  destroy(): void;
}

// ============================================================================
// Device Creation
// ============================================================================

/**
 * Options for requesting a GPU device.
 */
export interface GfxDeviceDescriptor {
  /** Debug label */
  label?: string;
  /** Required features */
  requiredFeatures?: GfxFeature[];
  /** Required limits (request higher than defaults) */
  requiredLimits?: Partial<GfxLimits>;
  /** Default bind group layouts for auto pipeline layout */
  defaultQueue?: { label?: string };
}

/**
 * Adapter information.
 */
export interface GfxAdapterInfo {
  /** Vendor name */
  readonly vendor: string;
  /** Architecture name */
  readonly architecture: string;
  /** Device name */
  readonly device: string;
  /** Driver description */
  readonly description: string;
}

/**
 * GPU Adapter for device creation.
 */
export interface GfxAdapter {
  /** Adapter info */
  readonly info: GfxAdapterInfo;
  /** Supported features */
  readonly features: ReadonlySet<GfxFeature>;
  /** Adapter limits */
  readonly limits: GfxLimits;
  /** Whether adapter is a fallback adapter */
  readonly isFallbackAdapter: boolean;

  /**
   * Request a device from this adapter.
   */
  requestDevice(descriptor?: GfxDeviceDescriptor): Promise<GfxDevice>;
}

/**
 * Options for requesting an adapter.
 */
export interface GfxRequestAdapterOptions {
  /** Power preference */
  powerPreference?: "low-power" | "high-performance";
  /** Force fallback adapter */
  forceFallbackAdapter?: boolean;
}
