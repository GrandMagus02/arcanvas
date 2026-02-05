/**
 * @arcanvas/gfx - Render pipeline
 *
 * Graphics pipeline for rendering.
 */

import type { GfxShaderModule } from "./shader.js";
import type { GfxPipelineLayout, GfxBindGroupLayout } from "./bindGroup.js";
import type { GfxVertexBufferLayout } from "./vertexLayout.js";
import type { ColorTargetState, DepthStencilState, PrimitiveState, MultisampleState } from "../types/states.js";

// ============================================================================
// Pipeline Stage Descriptors
// ============================================================================

/**
 * Vertex stage configuration.
 */
export interface GfxVertexState {
  /** Shader module containing vertex entry point */
  module: GfxShaderModule;
  /** Entry point function name (default: "main" or "vs_main") */
  entryPoint?: string;
  /** Constants for pipeline-overridable constants */
  constants?: Record<string, number>;
  /** Vertex buffer layouts */
  buffers?: GfxVertexBufferLayout[];
}

/**
 * Fragment stage configuration.
 */
export interface GfxFragmentState {
  /** Shader module containing fragment entry point */
  module: GfxShaderModule;
  /** Entry point function name (default: "main" or "fs_main") */
  entryPoint?: string;
  /** Constants for pipeline-overridable constants */
  constants?: Record<string, number>;
  /** Color target states */
  targets: (ColorTargetState | null)[];
}

// ============================================================================
// Render Pipeline Descriptor
// ============================================================================

/**
 * Descriptor for creating a render pipeline.
 */
export interface GfxRenderPipelineDescriptor {
  /** Debug label */
  label?: string;
  /** Pipeline layout (explicit) or "auto" for automatic layout */
  layout: GfxPipelineLayout | "auto";
  /** Vertex stage (required) */
  vertex: GfxVertexState;
  /** Fragment stage (optional for depth-only passes) */
  fragment?: GfxFragmentState;
  /** Primitive assembly state */
  primitive?: PrimitiveState;
  /** Depth-stencil state */
  depthStencil?: DepthStencilState;
  /** Multisample state */
  multisample?: MultisampleState;
}

// ============================================================================
// Render Pipeline Interface
// ============================================================================

/**
 * Opaque render pipeline handle.
 */
export interface GfxRenderPipeline {
  /** Debug label */
  readonly label: string | undefined;

  /**
   * Get the bind group layout for a specific group.
   * Only available if pipeline was created with layout: "auto".
   */
  getBindGroupLayout(groupIndex: number): GfxBindGroupLayout;
}

// ============================================================================
// Pipeline Defaults
// ============================================================================

/**
 * Default primitive state.
 */
export const DEFAULT_PRIMITIVE_STATE: Required<PrimitiveState> = {
  topology: "triangle-list",
  stripIndexFormat: undefined as unknown as "uint16",
  frontFace: "ccw",
  cullMode: "none",
  unclippedDepth: false,
};

/**
 * Default multisample state.
 */
export const DEFAULT_MULTISAMPLE_STATE: Required<MultisampleState> = {
  count: 1,
  mask: 0xffffffff,
  alphaToCoverageEnabled: false,
};

// ============================================================================
// Pipeline Key Generation
// ============================================================================

/**
 * Generate a cache key for a render pipeline descriptor.
 * Used for pipeline caching.
 */
export function generateRenderPipelineKey(desc: GfxRenderPipelineDescriptor): string {
  const parts: string[] = [];

  // Vertex state
  parts.push(`v:${desc.vertex.entryPoint ?? "main"}`);
  if (desc.vertex.buffers) {
    for (const buf of desc.vertex.buffers) {
      parts.push(`vb:${buf.arrayStride}:${buf.stepMode ?? "vertex"}`);
      for (const attr of buf.attributes) {
        parts.push(`va:${attr.shaderLocation}:${attr.format}:${attr.offset}`);
      }
    }
  }

  // Fragment state
  if (desc.fragment) {
    parts.push(`f:${desc.fragment.entryPoint ?? "main"}`);
    for (let i = 0; i < desc.fragment.targets.length; i++) {
      const target = desc.fragment.targets[i];
      if (target) {
        parts.push(`ct${i}:${target.format}:${target.writeMask ?? 0xf}`);
        if (target.blend) {
          parts.push(`bl:${target.blend.color.srcFactor}:${target.blend.color.dstFactor}:${target.blend.color.operation}`);
        }
      }
    }
  }

  // Primitive state
  const prim = desc.primitive ?? {};
  parts.push(`p:${prim.topology ?? "triangle-list"}:${prim.cullMode ?? "none"}:${prim.frontFace ?? "ccw"}`);

  // Depth-stencil state
  if (desc.depthStencil) {
    const ds = desc.depthStencil;
    parts.push(`ds:${ds.format}:${ds.depthCompare ?? "always"}:${ds.depthWriteEnabled ?? false}`);
  }

  // Multisample state
  const ms = desc.multisample ?? {};
  parts.push(`ms:${ms.count ?? 1}`);

  return parts.join("|");
}
