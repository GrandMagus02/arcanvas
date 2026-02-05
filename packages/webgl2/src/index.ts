/**
 * @arcanvas/webgl2 - WebGL2 Graphics Adapter
 *
 * WebGL2 implementation of the @arcanvas/gfx interfaces.
 *
 * @example
 * ```ts
 * import { requestAdapter, isWebGL2Supported } from '@arcanvas/webgl2';
 *
 * if (isWebGL2Supported()) {
 *   const adapter = await requestAdapter({ canvas: myCanvas });
 *   const device = await adapter.requestDevice();
 *   // Use device to create buffers, textures, pipelines...
 * }
 * ```
 *
 * @packageDocumentation
 */

// Re-export gfx types and utilities
export * from "@arcanvas/gfx";

// Adapter (entry point)
export { requestAdapter, isWebGL2Supported, getPreferredCanvasFormat, WebGL2Adapter } from "./adapter.js";

// Device
export { WebGL2Device } from "./device.js";

// Queue
export { WebGL2Queue } from "./queue.js";

// Resources
export { WebGL2Buffer } from "./resources/buffer.js";
export { WebGL2Texture, WebGL2TextureView } from "./resources/texture.js";
export { WebGL2Sampler } from "./resources/sampler.js";

// Pipeline
export { WebGL2ShaderModule } from "./pipeline/shader.js";
export { WebGL2Program } from "./pipeline/program.js";
export { WebGL2BindGroupLayout, WebGL2BindGroup } from "./pipeline/bindGroup.js";
export { WebGL2RenderPipeline } from "./pipeline/renderPipeline.js";

// Command
export { WebGL2CommandEncoder, WebGL2CommandBuffer } from "./command/encoder.js";
export { WebGL2RenderPassEncoder } from "./command/renderPass.js";

// Constants (for advanced use)
export * from "./constants.js";
