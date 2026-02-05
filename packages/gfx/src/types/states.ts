/**
 * @arcanvas/gfx - Pipeline state types
 *
 * Blend, depth-stencil, and other pipeline state configurations.
 */

import type { TextureFormat } from "./formats.js";
import type { ColorWriteFlags } from "./usages.js";

// ============================================================================
// Blend State
// ============================================================================

/**
 * Blend factor for blend equations.
 */
export type BlendFactor =
  | "zero"
  | "one"
  | "src"
  | "one-minus-src"
  | "src-alpha"
  | "one-minus-src-alpha"
  | "dst"
  | "one-minus-dst"
  | "dst-alpha"
  | "one-minus-dst-alpha"
  | "src-alpha-saturated"
  | "constant"
  | "one-minus-constant";

/**
 * Blend operation.
 */
export type BlendOperation = "add" | "subtract" | "reverse-subtract" | "min" | "max";

/**
 * Component-level blend state.
 */
export interface BlendComponent {
  /** Source factor */
  srcFactor?: BlendFactor;
  /** Destination factor */
  dstFactor?: BlendFactor;
  /** Blend operation */
  operation?: BlendOperation;
}

/**
 * Full blend state for a color target.
 */
export interface BlendState {
  /** Color blend component */
  color: BlendComponent;
  /** Alpha blend component */
  alpha: BlendComponent;
}

/**
 * Color target state in render pipeline.
 */
export interface ColorTargetState {
  /** Texture format of the target */
  format: TextureFormat;
  /** Optional blend state (undefined = no blending) */
  blend?: BlendState;
  /** Write mask (default: ALL) */
  writeMask?: ColorWriteFlags;
}

// ============================================================================
// Depth-Stencil State
// ============================================================================

/**
 * Comparison function for depth/stencil testing.
 */
export type CompareFunction = "never" | "less" | "equal" | "less-equal" | "greater" | "not-equal" | "greater-equal" | "always";

/**
 * Stencil operation.
 */
export type StencilOperation = "keep" | "zero" | "replace" | "invert" | "increment-clamp" | "decrement-clamp" | "increment-wrap" | "decrement-wrap";

/**
 * Face-specific stencil state.
 */
export interface StencilFaceState {
  /** Comparison function */
  compare?: CompareFunction;
  /** Operation on stencil fail */
  failOp?: StencilOperation;
  /** Operation on depth fail */
  depthFailOp?: StencilOperation;
  /** Operation on pass */
  passOp?: StencilOperation;
}

/**
 * Depth-stencil state for render pipeline.
 */
export interface DepthStencilState {
  /** Depth/stencil texture format */
  format: TextureFormat;
  /** Enable depth writes */
  depthWriteEnabled?: boolean;
  /** Depth comparison function */
  depthCompare?: CompareFunction;
  /** Front face stencil state */
  stencilFront?: StencilFaceState;
  /** Back face stencil state */
  stencilBack?: StencilFaceState;
  /** Stencil read mask */
  stencilReadMask?: number;
  /** Stencil write mask */
  stencilWriteMask?: number;
  /** Depth bias (constant factor) */
  depthBias?: number;
  /** Depth bias slope scale */
  depthBiasSlopeScale?: number;
  /** Depth bias clamp */
  depthBiasClamp?: number;
}

// ============================================================================
// Primitive State
// ============================================================================

/**
 * Primitive topology.
 */
export type PrimitiveTopology = "point-list" | "line-list" | "line-strip" | "triangle-list" | "triangle-strip";

/**
 * Front face winding order.
 */
export type FrontFace = "ccw" | "cw";

/**
 * Face culling mode.
 */
export type CullMode = "none" | "front" | "back";

/**
 * Primitive state for render pipeline.
 */
export interface PrimitiveState {
  /** Primitive topology */
  topology?: PrimitiveTopology;
  /** Strip index format (for strip topologies with primitive restart) */
  stripIndexFormat?: "uint16" | "uint32";
  /** Front face winding */
  frontFace?: FrontFace;
  /** Cull mode */
  cullMode?: CullMode;
  /** Enable depth clipping (WebGPU feature) */
  unclippedDepth?: boolean;
}

// ============================================================================
// Multisample State
// ============================================================================

/**
 * Multisample state for render pipeline.
 */
export interface MultisampleState {
  /** Sample count (1, 4) */
  count?: number;
  /** Sample mask */
  mask?: number;
  /** Enable alpha-to-coverage */
  alphaToCoverageEnabled?: boolean;
}

// ============================================================================
// Default Blend Presets
// ============================================================================

/**
 * Common blend state presets.
 */
export const BlendPresets = {
  /** Standard alpha blending: src.rgb * src.a + dst.rgb * (1-src.a) */
  ALPHA: {
    color: {
      srcFactor: "src-alpha",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    },
    alpha: {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    },
  } satisfies BlendState,

  /** Premultiplied alpha: src.rgb + dst.rgb * (1-src.a) */
  PREMULTIPLIED: {
    color: {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    },
    alpha: {
      srcFactor: "one",
      dstFactor: "one-minus-src-alpha",
      operation: "add",
    },
  } satisfies BlendState,

  /** Additive blending: src.rgb + dst.rgb */
  ADDITIVE: {
    color: {
      srcFactor: "one",
      dstFactor: "one",
      operation: "add",
    },
    alpha: {
      srcFactor: "one",
      dstFactor: "one",
      operation: "add",
    },
  } satisfies BlendState,

  /** Multiply blending: src.rgb * dst.rgb */
  MULTIPLY: {
    color: {
      srcFactor: "dst",
      dstFactor: "zero",
      operation: "add",
    },
    alpha: {
      srcFactor: "dst-alpha",
      dstFactor: "zero",
      operation: "add",
    },
  } satisfies BlendState,
} as const;
