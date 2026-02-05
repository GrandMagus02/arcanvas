/**
 * @arcanvas/webgpu - WebGPU Adapter
 *
 * Entry point for requesting WebGPU adapters.
 */

import type { GfxAdapter, GfxAdapterInfo, GfxRequestAdapterOptions, GfxDeviceDescriptor, GfxDevice, GfxFeature, GfxLimits } from "@arcanvas/gfx";
import { WebGPUDevice } from "./device.js";

// ============================================================================
// Feature Mapping
// ============================================================================

/**
 * Mapping from WebGPU feature names to GfxFeature.
 * Partial record since WebGPU features change over time.
 */
const WEBGPU_FEATURE_MAP: Partial<Record<string, GfxFeature | null>> = {
  "depth-clip-control": "depth-clip-control",
  "depth32float-stencil8": "depth32float-stencil8",
  "texture-compression-bc": "texture-compression-bc",
  "texture-compression-bc-sliced-3d": null,
  "texture-compression-etc2": "texture-compression-etc2",
  "texture-compression-astc": "texture-compression-astc",
  "texture-compression-astc-sliced-3d": null,
  "timestamp-query": "timestamp-query",
  "indirect-first-instance": "indirect-first-instance",
  "shader-f16": "shader-f16",
  "rg11b10ufloat-renderable": "rg11b10ufloat-renderable",
  "bgra8unorm-storage": "bgra8unorm-storage",
  "float32-filterable": "float32-filterable",
  "float32-blendable": null,
  "clip-distances": null,
  "dual-source-blending": "dual-source-blending",
  subgroups: "subgroups",
  // Newer features - map to null if not in our feature set
  "core-features-and-limits": null,
  "texture-formats-tier1": null,
  "texture-formats-tier2": null,
};

/**
 * Map WebGPU features to GfxFeatures.
 */
function mapWebGPUFeatures(webgpuFeatures: GPUSupportedFeatures): Set<GfxFeature> {
  const features = new Set<GfxFeature>();

  // WebGPU always supports these
  features.add("storage-buffers");
  features.add("compute-shaders");

  for (const wf of webgpuFeatures) {
    const gfxFeature = WEBGPU_FEATURE_MAP[wf];
    if (gfxFeature) {
      features.add(gfxFeature);
    }
  }

  return features;
}

// ============================================================================
// Limits Mapping
// ============================================================================

/**
 * Map WebGPU limits to GfxLimits.
 */
function mapWebGPULimits(webgpuLimits: GPUSupportedLimits): GfxLimits {
  // Cast to access potentially newer properties
  const limits = webgpuLimits as GPUSupportedLimits & {
    maxInterStageShaderComponents?: number;
    maxBindGroupsPlusVertexBuffers?: number;
    maxColorAttachmentBytesPerSample?: number;
  };

  return {
    maxTextureDimension1D: limits.maxTextureDimension1D,
    maxTextureDimension2D: limits.maxTextureDimension2D,
    maxTextureDimension3D: limits.maxTextureDimension3D,
    maxTextureArrayLayers: limits.maxTextureArrayLayers,
    maxBindGroups: limits.maxBindGroups,
    maxBindGroupsPlusVertexBuffers: limits.maxBindGroupsPlusVertexBuffers ?? 24,
    maxBindingsPerBindGroup: limits.maxBindingsPerBindGroup,
    maxDynamicUniformBuffersPerPipelineLayout: limits.maxDynamicUniformBuffersPerPipelineLayout,
    maxDynamicStorageBuffersPerPipelineLayout: limits.maxDynamicStorageBuffersPerPipelineLayout,
    maxSampledTexturesPerShaderStage: limits.maxSampledTexturesPerShaderStage,
    maxSamplersPerShaderStage: limits.maxSamplersPerShaderStage,
    maxStorageBuffersPerShaderStage: limits.maxStorageBuffersPerShaderStage,
    maxStorageTexturesPerShaderStage: limits.maxStorageTexturesPerShaderStage,
    maxUniformBuffersPerShaderStage: limits.maxUniformBuffersPerShaderStage,
    maxUniformBufferBindingSize: limits.maxUniformBufferBindingSize,
    maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
    minUniformBufferOffsetAlignment: limits.minUniformBufferOffsetAlignment,
    minStorageBufferOffsetAlignment: limits.minStorageBufferOffsetAlignment,
    maxVertexBuffers: limits.maxVertexBuffers,
    maxBufferSize: limits.maxBufferSize,
    maxVertexAttributes: limits.maxVertexAttributes,
    maxVertexBufferArrayStride: limits.maxVertexBufferArrayStride,
    maxInterStageShaderComponents: limits.maxInterStageShaderComponents ?? 60,
    maxInterStageShaderVariables: limits.maxInterStageShaderVariables,
    maxColorAttachments: limits.maxColorAttachments,
    maxColorAttachmentBytesPerSample: limits.maxColorAttachmentBytesPerSample ?? 32,
    maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
    maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
    maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
    maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
    maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
    maxComputeWorkgroupsPerDimension: limits.maxComputeWorkgroupsPerDimension,
  };
}

// ============================================================================
// WebGPU Adapter
// ============================================================================

/**
 * WebGPU adapter wrapper.
 */
export class WebGPUAdapter implements GfxAdapter {
  private readonly _adapter: GPUAdapter;
  private _info: GfxAdapterInfo | null = null;

  constructor(adapter: GPUAdapter) {
    this._adapter = adapter;
  }

  get info(): GfxAdapterInfo {
    if (!this._info) {
      const info = this._adapter.info;
      this._info = {
        vendor: info.vendor,
        architecture: info.architecture,
        device: info.device,
        description: info.description,
      };
    }
    return this._info;
  }

  get features(): ReadonlySet<GfxFeature> {
    return mapWebGPUFeatures(this._adapter.features);
  }

  get limits(): GfxLimits {
    return mapWebGPULimits(this._adapter.limits);
  }

  get isFallbackAdapter(): boolean {
    // Cast to access potentially newer property
    return (this._adapter as GPUAdapter & { isFallbackAdapter?: boolean }).isFallbackAdapter ?? false;
  }

  /** Get the underlying WebGPU adapter */
  get native(): GPUAdapter {
    return this._adapter;
  }

  async requestDevice(descriptor?: GfxDeviceDescriptor): Promise<GfxDevice> {
    const requiredFeatures: GPUFeatureName[] = [];
    if (descriptor?.requiredFeatures) {
      for (const f of descriptor.requiredFeatures) {
        // Find the WebGPU feature name for this GfxFeature
        for (const [wf, gf] of Object.entries(WEBGPU_FEATURE_MAP)) {
          if (gf === f) {
            requiredFeatures.push(wf as GPUFeatureName);
            break;
          }
        }
      }
    }

    const requiredLimits: Record<string, number> = {};
    if (descriptor?.requiredLimits) {
      for (const [key, value] of Object.entries(descriptor.requiredLimits)) {
        if (value !== undefined) {
          requiredLimits[key] = value;
        }
      }
    }

    const gpuDevice = await this._adapter.requestDevice({
      label: descriptor?.label,
      requiredFeatures,
      requiredLimits,
      defaultQueue: descriptor?.defaultQueue,
    });

    return new WebGPUDevice(gpuDevice, this);
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if WebGPU is supported in the current environment.
 */
export function isWebGPUSupported(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

/**
 * Request a WebGPU adapter.
 *
 * @param options - Adapter request options
 * @returns Promise resolving to adapter, or null if not available
 */
export async function requestAdapter(options?: GfxRequestAdapterOptions): Promise<GfxAdapter | null> {
  if (!isWebGPUSupported()) {
    return null;
  }

  const gpuAdapter = await navigator.gpu.requestAdapter({
    powerPreference: options?.powerPreference,
    forceFallbackAdapter: options?.forceFallbackAdapter,
  });

  if (!gpuAdapter) {
    return null;
  }

  return new WebGPUAdapter(gpuAdapter);
}

/**
 * Get the preferred canvas format for WebGPU.
 */
export function getPreferredCanvasFormat(): string {
  if (!isWebGPUSupported()) {
    return "bgra8unorm";
  }
  return navigator.gpu.getPreferredCanvasFormat();
}
