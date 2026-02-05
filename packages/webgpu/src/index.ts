/**
 * @arcanvas/webgpu - WebGPU Adapter for @arcanvas/gfx
 *
 * This package provides the WebGPU implementation of the @arcanvas/gfx interfaces.
 *
 * @example
 * ```ts
 * import { requestAdapter, getPreferredCanvasFormat } from '@arcanvas/webgpu';
 * import { BufferUsage, wgsl } from '@arcanvas/gfx';
 *
 * const adapter = await requestAdapter({ powerPreference: 'high-performance' });
 * if (!adapter) throw new Error('No WebGPU adapter available');
 *
 * const device = await adapter.requestDevice();
 *
 * const buffer = device.createBuffer({
 *   size: 1024,
 *   usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
 * });
 *
 * const shader = device.createShaderModule({
 *   sources: [wgsl(`
 *     @vertex fn vs_main(@location(0) pos: vec3f) -> @builtin(position) vec4f {
 *       return vec4f(pos, 1.0);
 *     }
 *     @fragment fn fs_main() -> @location(0) vec4f {
 *       return vec4f(1.0, 0.0, 0.0, 1.0);
 *     }
 *   `)],
 * });
 * ```
 *
 * @packageDocumentation
 */

// Re-export everything from @arcanvas/gfx for convenience
export * from "@arcanvas/gfx";

// Export adapter entry points
export { requestAdapter, isWebGPUSupported, getPreferredCanvasFormat, WebGPUAdapter } from "./adapter.js";

// Export device
export { WebGPUDevice } from "./device.js";

// Export resource implementations (for advanced use)
export { WebGPUBuffer } from "./resources/buffer.js";
export { WebGPUTexture, WebGPUTextureView } from "./resources/texture.js";
export { WebGPUSampler } from "./resources/sampler.js";

// Export pipeline implementations
export { WebGPUShaderModule } from "./pipeline/shader.js";
export { WebGPUBindGroupLayout, WebGPUBindGroup, WebGPUPipelineLayout } from "./pipeline/bindGroup.js";
export { WebGPURenderPipeline } from "./pipeline/renderPipeline.js";
export { WebGPUComputePipeline } from "./pipeline/computePipeline.js";

// Export command implementations
export { WebGPUCommandEncoder, WebGPUCommandBuffer } from "./command/encoder.js";
export { WebGPUQueue } from "./command/queue.js";
export { WebGPURenderPassEncoder } from "./command/renderPass.js";
export { WebGPUComputePassEncoder } from "./command/computePass.js";
