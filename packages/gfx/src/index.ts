/**
 * @arcanvas/gfx - WebGPU-like Graphics Kernel
 *
 * Backend-agnostic GPU abstraction layer for arcanvas.
 *
 * This package provides:
 * - WebGPU-style explicit API (no implicit state)
 * - Interfaces for devices, resources, pipelines, and commands
 * - Type definitions for formats, usages, and states
 * - Shader system with WGSL canonical format
 * - Utility functions for common operations
 *
 * The actual implementations live in adapter packages:
 * - @arcanvas/webgpu (WebGPU native)
 * - @arcanvas/webgl (WebGL2 emulation)
 *
 * @example
 * ```ts
 * import { GfxDevice, BufferUsage, wgsl } from '@arcanvas/gfx';
 *
 * // Device is provided by adapter
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
 *   `)],
 * });
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Core Types
// ============================================================================

export * from "./types/index.js";

// ============================================================================
// Resources
// ============================================================================

export * from "./resource/index.js";

// ============================================================================
// Pipeline
// ============================================================================

export * from "./pipeline/index.js";

// ============================================================================
// Commands
// ============================================================================

export * from "./command/index.js";

// ============================================================================
// Device
// ============================================================================

export * from "./device.js";

// ============================================================================
// Geometry
// ============================================================================

export * from "./geometry/index.js";

// ============================================================================
// Shader Utilities
// ============================================================================

export * from "./shader/index.js";

// ============================================================================
// Utilities
// ============================================================================

export * from "./util/index.js";
