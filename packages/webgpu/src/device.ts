/**
 * @arcanvas/webgpu - WebGPU Device Implementation
 *
 * Implements GfxDevice interface for WebGPU.
 */

import type {
  GfxDevice,
  GfxDeviceLostInfo,
  GfxCapabilities,
  GfxFeature,
  GfxLimits,
  GfxBuffer,
  GfxBufferDescriptor,
  GfxTexture,
  GfxTextureDescriptor,
  GfxSampler,
  GfxSamplerDescriptor,
  GfxShaderModule,
  GfxShaderModuleDescriptor,
  GfxBindGroupLayout,
  GfxBindGroupLayoutDescriptor,
  GfxBindGroup,
  GfxBindGroupDescriptor,
  GfxPipelineLayout,
  GfxPipelineLayoutDescriptor,
  GfxRenderPipeline,
  GfxRenderPipelineDescriptor,
  GfxComputePipeline,
  GfxComputePipelineDescriptor,
  GfxCommandEncoder,
  GfxCommandEncoderDescriptor,
  GfxQueue,
  GfxError,
  TextureFormat,
  FormatCapabilities,
} from "@arcanvas/gfx";
import { GfxValidationError, GfxOutOfMemoryError } from "@arcanvas/gfx";
import type { WebGPUAdapter } from "./adapter.js";
import { WebGPUBuffer } from "./resources/buffer.js";
import { WebGPUTexture } from "./resources/texture.js";
import { WebGPUSampler } from "./resources/sampler.js";
import { WebGPUShaderModule } from "./pipeline/shader.js";
import { WebGPUBindGroupLayout, WebGPUBindGroup, WebGPUPipelineLayout } from "./pipeline/bindGroup.js";
import { WebGPURenderPipeline } from "./pipeline/renderPipeline.js";
import { WebGPUComputePipeline } from "./pipeline/computePipeline.js";
import { WebGPUCommandEncoder } from "./command/encoder.js";
import { WebGPUQueue } from "./command/queue.js";

// ============================================================================
// Capabilities Implementation
// ============================================================================

/**
 * WebGPU capabilities implementation.
 */
class WebGPUCapabilities implements GfxCapabilities {
  constructor(
    private readonly device: GPUDevice,
    private readonly adapter: WebGPUAdapter
  ) {}

  get backendId(): string {
    return "webgpu";
  }

  get backendInfo(): string {
    return `WebGPU (${this.adapter.info.description})`;
  }

  get deviceName(): string {
    return this.adapter.info.device || "Unknown GPU";
  }

  get features(): ReadonlySet<GfxFeature> {
    return this.adapter.features;
  }

  get limits(): GfxLimits {
    return this.adapter.limits;
  }

  getFormatCapabilities(format: TextureFormat): FormatCapabilities | null {
    // WebGPU supports most formats - this is a simplified implementation
    // In production, query actual format support
    const info = {
      filterable: true,
      storage: false,
      renderable: true,
      blendable: true,
      multisample: true,
      resolvable: true,
    };

    // Adjust based on format type
    if (format.includes("uint") || format.includes("sint")) {
      info.filterable = false;
      info.blendable = false;
    }

    if (format.startsWith("depth") || format.startsWith("stencil")) {
      info.storage = false;
      info.blendable = false;
    }

    if (format.includes("32float")) {
      info.filterable = this.features.has("float32-filterable");
    }

    return info;
  }

  hasFeature(feature: GfxFeature): boolean {
    return this.features.has(feature);
  }
}

// ============================================================================
// Device Implementation
// ============================================================================

/**
 * WebGPU device implementation.
 */
export class WebGPUDevice implements GfxDevice {
  private readonly _device: GPUDevice;
  private readonly _adapter: WebGPUAdapter;
  private readonly _capabilities: WebGPUCapabilities;
  private readonly _queue: WebGPUQueue;
  private readonly _lost: Promise<GfxDeviceLostInfo>;
  private _errorScopeStack: Array<"validation" | "out-of-memory" | "internal"> = [];

  constructor(device: GPUDevice, adapter: WebGPUAdapter) {
    this._device = device;
    this._adapter = adapter;
    this._capabilities = new WebGPUCapabilities(device, adapter);
    this._queue = new WebGPUQueue(device.queue);

    // Set up device lost handling
    this._lost = device.lost.then((info) => ({
      reason: info.reason === "destroyed" ? "destroyed" : "unknown",
      message: info.message,
    }));
  }

  get label(): string | undefined {
    return this._device.label || undefined;
  }

  get capabilities(): GfxCapabilities {
    return this._capabilities;
  }

  get limits(): GfxLimits {
    return this._adapter.limits;
  }

  get features(): ReadonlySet<GfxFeature> {
    return this._adapter.features;
  }

  get queue(): GfxQueue {
    return this._queue;
  }

  get lost(): Promise<GfxDeviceLostInfo> {
    return this._lost;
  }

  /** Get the underlying WebGPU device */
  get native(): GPUDevice {
    return this._device;
  }

  // ============================================================================
  // Error Scope
  // ============================================================================

  pushErrorScope(filter: "validation" | "out-of-memory" | "internal"): void {
    this._device.pushErrorScope(filter);
    this._errorScopeStack.push(filter);
  }

  async popErrorScope(): Promise<GfxError | null> {
    if (this._errorScopeStack.length === 0) {
      throw new GfxValidationError("No error scope to pop");
    }

    this._errorScopeStack.pop();
    const error = await this._device.popErrorScope();

    if (!error) {
      return null;
    }

    if (error instanceof GPUValidationError) {
      return new GfxValidationError(error.message);
    }

    if (error instanceof GPUOutOfMemoryError) {
      return new GfxOutOfMemoryError(error.message);
    }

    // GPUInternalError
    return new GfxValidationError(`Internal GPU error: ${error.message}`);
  }

  // ============================================================================
  // Resource Creation
  // ============================================================================

  createBuffer(descriptor: GfxBufferDescriptor): GfxBuffer {
    return WebGPUBuffer.create(this._device, descriptor);
  }

  createTexture(descriptor: GfxTextureDescriptor): GfxTexture {
    return WebGPUTexture.create(this._device, descriptor);
  }

  createSampler(descriptor?: GfxSamplerDescriptor): GfxSampler {
    return WebGPUSampler.create(this._device, descriptor);
  }

  // ============================================================================
  // Shader/Pipeline Creation
  // ============================================================================

  createShaderModule(descriptor: GfxShaderModuleDescriptor): GfxShaderModule {
    return WebGPUShaderModule.create(this._device, descriptor);
  }

  createBindGroupLayout(descriptor: GfxBindGroupLayoutDescriptor): GfxBindGroupLayout {
    return WebGPUBindGroupLayout.create(this._device, descriptor);
  }

  createBindGroup(descriptor: GfxBindGroupDescriptor): GfxBindGroup {
    return WebGPUBindGroup.create(this._device, descriptor);
  }

  createPipelineLayout(descriptor: GfxPipelineLayoutDescriptor): GfxPipelineLayout {
    return WebGPUPipelineLayout.create(this._device, descriptor);
  }

  createRenderPipeline(descriptor: GfxRenderPipelineDescriptor): GfxRenderPipeline {
    return WebGPURenderPipeline.create(this._device, descriptor);
  }

  async createRenderPipelineAsync(descriptor: GfxRenderPipelineDescriptor): Promise<GfxRenderPipeline> {
    return WebGPURenderPipeline.createAsync(this._device, descriptor);
  }

  createComputePipeline(descriptor: GfxComputePipelineDescriptor): GfxComputePipeline {
    return WebGPUComputePipeline.create(this._device, descriptor);
  }

  async createComputePipelineAsync(descriptor: GfxComputePipelineDescriptor): Promise<GfxComputePipeline> {
    return WebGPUComputePipeline.createAsync(this._device, descriptor);
  }

  // ============================================================================
  // Command Encoding
  // ============================================================================

  createCommandEncoder(descriptor?: GfxCommandEncoderDescriptor): GfxCommandEncoder {
    return WebGPUCommandEncoder.create(this._device, descriptor);
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  destroy(): void {
    this._device.destroy();
  }
}
