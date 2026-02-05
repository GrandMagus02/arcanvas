/**
 * @arcanvas/webgl2 - WebGL2 Adapter
 *
 * Entry point for requesting WebGL2 devices.
 */

import type { GfxAdapter, GfxAdapterInfo, GfxRequestAdapterOptions, GfxDeviceDescriptor, GfxDevice, GfxFeature, GfxLimits, GfxCapabilities, FormatCapabilities, TextureFormat } from "@arcanvas/gfx";
import { WebGL2Device } from "./device.js";

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Detect supported features from WebGL2 extensions.
 */
function detectFeatures(gl: WebGL2RenderingContext): Set<GfxFeature> {
  const features = new Set<GfxFeature>();

  // WebGL2 always supports these
  features.add("storage-buffers"); // Via transform feedback or textures

  // Check for texture compression extensions
  if (gl.getExtension("WEBGL_compressed_texture_s3tc")) {
    features.add("texture-compression-bc");
  }
  if (gl.getExtension("WEBGL_compressed_texture_etc")) {
    features.add("texture-compression-etc2");
  }
  if (gl.getExtension("WEBGL_compressed_texture_astc")) {
    features.add("texture-compression-astc");
  }

  // Check for float texture filtering
  if (gl.getExtension("OES_texture_float_linear")) {
    features.add("float32-filterable");
  }

  // Check for depth clip control (WebGL2 doesn't have native support)
  // features.add("depth-clip-control"); // Not available

  // Check for render to float textures
  if (gl.getExtension("EXT_color_buffer_float")) {
    features.add("rg11b10ufloat-renderable");
  }

  return features;
}

/**
 * Query device limits from WebGL2.
 */
function queryLimits(gl: WebGL2RenderingContext): GfxLimits {
  return {
    maxTextureDimension1D: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    maxTextureDimension2D: gl.getParameter(gl.MAX_TEXTURE_SIZE) as number,
    maxTextureDimension3D: gl.getParameter(gl.MAX_3D_TEXTURE_SIZE) as number,
    maxTextureArrayLayers: gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS) as number,
    maxBindGroups: 4, // Emulated
    maxBindGroupsPlusVertexBuffers: 24, // Emulated
    maxBindingsPerBindGroup: 16, // Emulated
    maxDynamicUniformBuffersPerPipelineLayout: 8,
    maxDynamicStorageBuffersPerPipelineLayout: 0, // WebGL2 doesn't have storage buffers
    maxSampledTexturesPerShaderStage: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) as number,
    maxSamplersPerShaderStage: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) as number,
    maxStorageBuffersPerShaderStage: 0, // WebGL2 doesn't have storage buffers
    maxStorageTexturesPerShaderStage: 0, // WebGL2 doesn't have storage textures
    maxUniformBuffersPerShaderStage: gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS) as number,
    maxUniformBufferBindingSize: gl.getParameter(gl.MAX_UNIFORM_BLOCK_SIZE) as number,
    maxStorageBufferBindingSize: 0,
    minUniformBufferOffsetAlignment: gl.getParameter(gl.UNIFORM_BUFFER_OFFSET_ALIGNMENT) as number,
    minStorageBufferOffsetAlignment: 256, // Default
    maxVertexBuffers: gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number,
    maxBufferSize: 2147483647, // 2GB (browser limit)
    maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS) as number,
    maxVertexBufferArrayStride: 2048, // Reasonable default
    maxInterStageShaderComponents: gl.getParameter(gl.MAX_VARYING_COMPONENTS) as number,
    maxInterStageShaderVariables: Math.floor((gl.getParameter(gl.MAX_VARYING_COMPONENTS) as number) / 4),
    maxColorAttachments: gl.getParameter(gl.MAX_COLOR_ATTACHMENTS) as number,
    maxColorAttachmentBytesPerSample: 32,
    maxComputeWorkgroupStorageSize: 0, // No compute
    maxComputeInvocationsPerWorkgroup: 0,
    maxComputeWorkgroupSizeX: 0,
    maxComputeWorkgroupSizeY: 0,
    maxComputeWorkgroupSizeZ: 0,
    maxComputeWorkgroupsPerDimension: 0,
  };
}

// ============================================================================
// WebGL2 Adapter
// ============================================================================

/**
 * WebGL2 adapter wrapper.
 */
/**
 * Get format capabilities for WebGL2.
 */
function getWebGL2FormatCapabilities(format: TextureFormat, _gl: WebGL2RenderingContext): FormatCapabilities | null {
  // Basic format support - WebGL2 supports most common formats
  const baseFormats: Set<TextureFormat> = new Set([
    "r8unorm",
    "rg8unorm",
    "rgba8unorm",
    "rgba8unorm-srgb",
    "r16float",
    "rg16float",
    "rgba16float",
    "r32float",
    "rg32float",
    "rgba32float",
    "depth16unorm",
    "depth24plus",
    "depth24plus-stencil8",
    "depth32float",
  ]);

  if (!baseFormats.has(format)) {
    return null;
  }

  const isDepth = format.startsWith("depth");

  return {
    filterable: !isDepth || format === "depth16unorm",
    storage: false, // WebGL2 doesn't have storage textures
    renderable: true,
    blendable: !isDepth && !format.includes("32float"),
    multisample: true,
    resolvable: !isDepth,
  };
}

/**
 * WebGL2 adapter implementation.
 */
export class WebGL2Adapter implements GfxAdapter {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _canvas: HTMLCanvasElement | OffscreenCanvas;
  private _info: GfxAdapterInfo | null = null;
  private _features: Set<GfxFeature> | null = null;
  private _limits: GfxLimits | null = null;
  private _capabilities: GfxCapabilities | null = null;

  constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement | OffscreenCanvas) {
    this._gl = gl;
    this._canvas = canvas;
  }

  get info(): GfxAdapterInfo {
    if (!this._info) {
      const debugInfo = this._gl.getExtension("WEBGL_debug_renderer_info");
      this._info = {
        vendor: debugInfo ? (this._gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string) : "Unknown",
        architecture: "",
        device: debugInfo ? (this._gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string) : "Unknown",
        description: "WebGL2 Adapter",
      };
    }
    return this._info;
  }

  get features(): ReadonlySet<GfxFeature> {
    if (!this._features) {
      this._features = detectFeatures(this._gl);
    }
    return this._features;
  }

  get limits(): GfxLimits {
    if (!this._limits) {
      this._limits = queryLimits(this._gl);
    }
    return this._limits;
  }

  get capabilities(): GfxCapabilities {
    if (!this._capabilities) {
      const features = this.features;
      const limits = this.limits;
      const gl = this._gl;

      this._capabilities = {
        backendId: "webgl2",
        backendInfo: gl.getParameter(gl.VERSION) as string,
        deviceName: this.info.device,
        features,
        limits,
        getFormatCapabilities: (format: TextureFormat) => getWebGL2FormatCapabilities(format, gl),
        hasFeature: (feature: GfxFeature) => features.has(feature),
      };
    }
    return this._capabilities;
  }

  get isFallbackAdapter(): boolean {
    return false;
  }

  /** Get the underlying WebGL2 context */
  get native(): WebGL2RenderingContext {
    return this._gl;
  }

  requestDevice(descriptor?: GfxDeviceDescriptor): Promise<GfxDevice> {
    // WebGL2 doesn't have device creation - we already have the context
    // Just validate features and return a device wrapper

    if (descriptor?.requiredFeatures) {
      for (const feature of descriptor.requiredFeatures) {
        if (!this.features.has(feature)) {
          throw new Error(`Required feature not supported: ${feature}`);
        }
      }
    }

    return Promise.resolve(new WebGL2Device(this._gl, this, descriptor?.label));
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Check if WebGL2 is supported in the current environment.
 */
export function isWebGL2Supported(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    return gl !== null;
  } catch {
    return false;
  }
}

/**
 * Request a WebGL2 adapter.
 *
 * @param options - Adapter request options (canvas is required for WebGL2)
 * @returns Promise resolving to adapter, or null if not available
 */
export function requestAdapter(options?: GfxRequestAdapterOptions & { canvas?: HTMLCanvasElement | OffscreenCanvas }): Promise<GfxAdapter | null> {
  if (!isWebGL2Supported()) {
    return Promise.resolve(null);
  }

  // WebGL2 requires a canvas
  let canvas = options?.canvas;
  if (!canvas) {
    if (typeof document !== "undefined") {
      canvas = document.createElement("canvas");
    } else {
      return Promise.resolve(null);
    }
  }

  const contextOptions: WebGLContextAttributes = {
    alpha: true,
    antialias: false, // Usually handled by post-processing
    depth: true,
    stencil: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: false,
    powerPreference: options?.powerPreference ?? "default",
    failIfMajorPerformanceCaveat: false,
  };

  const gl = canvas.getContext("webgl2", contextOptions);
  if (!gl) {
    return Promise.resolve(null);
  }

  return Promise.resolve(new WebGL2Adapter(gl, canvas));
}

/**
 * Get the preferred canvas format for WebGL2.
 * WebGL2 typically uses RGBA8.
 */
export function getPreferredCanvasFormat(): string {
  return "rgba8unorm";
}
