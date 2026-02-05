/**
 * @arcanvas/webgl2 - WebGL2 Device Implementation
 */

import type {
  GfxDevice,
  GfxDeviceLostInfo,
  GfxQueue,
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
  GfxCapabilities,
  GfxErrorType,
  GfxError,
  GfxLimits,
  GfxFeature,
} from "@arcanvas/gfx";
import { GfxValidationError } from "@arcanvas/gfx";
import { WebGL2Buffer } from "./resources/buffer.js";
import { WebGL2Texture } from "./resources/texture.js";
import { WebGL2Sampler } from "./resources/sampler.js";
import { WebGL2ShaderModule } from "./pipeline/shader.js";
import { WebGL2BindGroupLayout, WebGL2BindGroup } from "./pipeline/bindGroup.js";
import { WebGL2RenderPipeline } from "./pipeline/renderPipeline.js";
import { WebGL2CommandEncoder } from "./command/encoder.js";
import { WebGL2Queue } from "./queue.js";
import type { WebGL2Adapter } from "./adapter.js";

/**
 * WebGL2 pipeline layout.
 */
class WebGL2PipelineLayout implements GfxPipelineLayout {
  private readonly _label: string | undefined;
  readonly bindGroupLayouts: GfxBindGroupLayout[];

  constructor(descriptor: GfxPipelineLayoutDescriptor) {
    this._label = descriptor.label;
    this.bindGroupLayouts = descriptor.bindGroupLayouts;
  }

  get label(): string | undefined {
    return this._label;
  }
}

/**
 * WebGL2 device implementing GfxDevice interface.
 */
export class WebGL2Device implements GfxDevice {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _adapter: WebGL2Adapter;
  private readonly _queue: WebGL2Queue;
  private readonly _label: string | undefined;
  private readonly _lost: Promise<GfxDeviceLostInfo>;
  private _lostResolver!: (info: GfxDeviceLostInfo) => void;
  private _destroyed = false;

  /** Error scope stack */
  private _errorScopes: Array<{ filter: GfxErrorType; errors: GfxError[] }> = [];

  constructor(gl: WebGL2RenderingContext, adapter: WebGL2Adapter, label?: string) {
    this._gl = gl;
    this._adapter = adapter;
    this._label = label;
    this._queue = new WebGL2Queue(gl);

    // Set up lost promise
    this._lost = new Promise((resolve) => {
      this._lostResolver = resolve;
    });

    // Listen for context lost
    const canvas = gl.canvas;
    if (canvas instanceof HTMLCanvasElement) {
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        this._lostResolver({ reason: "destroyed", message: "WebGL context lost" });
      });
    }
  }

  get label(): string | undefined {
    return this._label;
  }

  get capabilities(): GfxCapabilities {
    return this._adapter.capabilities;
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

  /** Get the underlying WebGL2 context */
  get native(): WebGL2RenderingContext {
    return this._gl;
  }

  // ============================================================================
  // Resource Creation
  // ============================================================================

  createBuffer(descriptor: GfxBufferDescriptor): GfxBuffer {
    this.checkDestroyed();
    return WebGL2Buffer.create(this._gl, descriptor);
  }

  createTexture(descriptor: GfxTextureDescriptor): GfxTexture {
    this.checkDestroyed();
    return WebGL2Texture.create(this._gl, descriptor);
  }

  createSampler(descriptor?: GfxSamplerDescriptor): GfxSampler {
    this.checkDestroyed();
    return WebGL2Sampler.create(this._gl, descriptor ?? {});
  }

  createShaderModule(descriptor: GfxShaderModuleDescriptor): GfxShaderModule {
    this.checkDestroyed();
    return WebGL2ShaderModule.create(this._gl, descriptor);
  }

  createBindGroupLayout(descriptor: GfxBindGroupLayoutDescriptor): GfxBindGroupLayout {
    this.checkDestroyed();
    return new WebGL2BindGroupLayout(descriptor);
  }

  createBindGroup(descriptor: GfxBindGroupDescriptor): GfxBindGroup {
    this.checkDestroyed();
    return new WebGL2BindGroup(descriptor);
  }

  createPipelineLayout(descriptor: GfxPipelineLayoutDescriptor): GfxPipelineLayout {
    this.checkDestroyed();
    // WebGL2 doesn't have explicit pipeline layouts
    // Store bindGroupLayouts internally but only expose label
    return new WebGL2PipelineLayout(descriptor);
  }

  createRenderPipeline(descriptor: GfxRenderPipelineDescriptor): GfxRenderPipeline {
    this.checkDestroyed();
    return WebGL2RenderPipeline.create(this._gl, descriptor);
  }

  createRenderPipelineAsync(descriptor: GfxRenderPipelineDescriptor): Promise<GfxRenderPipeline> {
    // WebGL2 compilation is synchronous
    return Promise.resolve(this.createRenderPipeline(descriptor));
  }

  createComputePipeline(_descriptor: GfxComputePipelineDescriptor): GfxComputePipeline {
    throw new GfxValidationError("Compute pipelines not supported in WebGL2");
  }

  createComputePipelineAsync(_descriptor: GfxComputePipelineDescriptor): Promise<GfxComputePipeline> {
    return Promise.reject(new GfxValidationError("Compute pipelines not supported in WebGL2"));
  }

  createCommandEncoder(descriptor?: { label?: string }): GfxCommandEncoder {
    this.checkDestroyed();
    return new WebGL2CommandEncoder(this._gl, descriptor?.label);
  }

  // ============================================================================
  // Error Handling
  // ============================================================================

  pushErrorScope(filter: GfxErrorType): void {
    this._errorScopes.push({ filter, errors: [] });
  }

  popErrorScope(): Promise<GfxError | null> {
    const scope = this._errorScopes.pop();
    if (!scope) {
      throw new GfxValidationError("No error scope to pop");
    }
    return Promise.resolve(scope.errors[0] ?? null);
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    // WebGL2 context cleanup is handled by the browser
    // We just need to signal that we're done
    this._lostResolver({ reason: "destroyed", message: "Device destroyed by application" });
  }

  private checkDestroyed(): void {
    if (this._destroyed) {
      throw new GfxValidationError("Device has been destroyed");
    }
  }
}
