/**
 * @arcanvas/gfx - Render pass
 *
 * Render pass encoding for draw commands.
 */

import type { GfxTextureView } from "../resource/texture.js";
import type { GfxBuffer } from "../resource/buffer.js";
import type { GfxBindGroup } from "../pipeline/bindGroup.js";
import type { GfxRenderPipeline } from "../pipeline/renderPipeline.js";
import type { IndexFormat } from "../types/formats.js";

// ============================================================================
// Render Pass Descriptor
// ============================================================================

/**
 * Load operation for attachments.
 */
export type LoadOp = "load" | "clear";

/**
 * Store operation for attachments.
 */
export type StoreOp = "store" | "discard";

/**
 * Color value for clearing.
 */
export interface GfxColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Color attachment descriptor.
 */
export interface GfxRenderPassColorAttachment {
  /** Texture view to render to */
  view: GfxTextureView;
  /** Texture view to resolve MSAA to (optional) */
  resolveTarget?: GfxTextureView;
  /** Clear value (required if loadOp is "clear") */
  clearValue?: GfxColor;
  /** Load operation (default: "clear") */
  loadOp: LoadOp;
  /** Store operation (default: "store") */
  storeOp: StoreOp;
}

/**
 * Depth-stencil attachment descriptor.
 */
export interface GfxRenderPassDepthStencilAttachment {
  /** Texture view to render to */
  view: GfxTextureView;
  /** Depth clear value */
  depthClearValue?: number;
  /** Depth load operation */
  depthLoadOp?: LoadOp;
  /** Depth store operation */
  depthStoreOp?: StoreOp;
  /** Is depth read-only */
  depthReadOnly?: boolean;
  /** Stencil clear value */
  stencilClearValue?: number;
  /** Stencil load operation */
  stencilLoadOp?: LoadOp;
  /** Stencil store operation */
  stencilStoreOp?: StoreOp;
  /** Is stencil read-only */
  stencilReadOnly?: boolean;
}

/**
 * Timestamp write descriptor.
 */
export interface GfxRenderPassTimestampWrites {
  /** Query set to write to */
  querySet: unknown; // GfxQuerySet when implemented
  /** Index for beginning timestamp */
  beginningOfPassWriteIndex?: number;
  /** Index for end timestamp */
  endOfPassWriteIndex?: number;
}

/**
 * Descriptor for beginning a render pass.
 */
export interface GfxRenderPassDescriptor {
  /** Debug label */
  label?: string;
  /** Color attachments */
  colorAttachments: (GfxRenderPassColorAttachment | null)[];
  /** Depth-stencil attachment (optional) */
  depthStencilAttachment?: GfxRenderPassDepthStencilAttachment;
  /** Occlusion query set (optional) */
  occlusionQuerySet?: unknown;
  /** Timestamp writes (optional) */
  timestampWrites?: GfxRenderPassTimestampWrites;
  /** Maximum draw count for indirect validation (optional) */
  maxDrawCount?: number;
}

// ============================================================================
// Render Pass Encoder Interface
// ============================================================================

/**
 * Render pass encoder for recording draw commands.
 */
export interface GfxRenderPassEncoder {
  /** Debug label */
  readonly label: string | undefined;

  // Pipeline state
  /**
   * Set the current render pipeline.
   */
  setPipeline(pipeline: GfxRenderPipeline): void;

  // Vertex/Index buffers
  /**
   * Set a vertex buffer.
   * @param slot - Vertex buffer slot
   * @param buffer - Buffer to bind
   * @param offset - Byte offset (default: 0)
   * @param size - Byte size (default: rest of buffer)
   */
  setVertexBuffer(slot: number, buffer: GfxBuffer | null, offset?: number, size?: number): void;

  /**
   * Set the index buffer.
   */
  setIndexBuffer(buffer: GfxBuffer, format: IndexFormat, offset?: number, size?: number): void;

  // Bind groups
  /**
   * Set a bind group.
   * @param index - Bind group index
   * @param bindGroup - Bind group to set
   * @param dynamicOffsets - Dynamic offsets for dynamic buffers
   */
  setBindGroup(index: number, bindGroup: GfxBindGroup | null, dynamicOffsets?: Iterable<number>): void;

  // Draw commands
  /**
   * Draw primitives.
   */
  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;

  /**
   * Draw indexed primitives.
   */
  drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;

  /**
   * Draw with parameters from a buffer.
   */
  drawIndirect(indirectBuffer: GfxBuffer, indirectOffset: number): void;

  /**
   * Draw indexed with parameters from a buffer.
   */
  drawIndexedIndirect(indirectBuffer: GfxBuffer, indirectOffset: number): void;

  // Dynamic state
  /**
   * Set viewport.
   */
  setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number): void;

  /**
   * Set scissor rectangle.
   */
  setScissorRect(x: number, y: number, width: number, height: number): void;

  /**
   * Set blend constant color.
   */
  setBlendConstant(color: GfxColor): void;

  /**
   * Set stencil reference value.
   */
  setStencilReference(reference: number): void;

  // Debug markers
  /**
   * Push a debug group.
   */
  pushDebugGroup(groupLabel: string): void;

  /**
   * Pop a debug group.
   */
  popDebugGroup(): void;

  /**
   * Insert a debug marker.
   */
  insertDebugMarker(markerLabel: string): void;

  // Queries
  /**
   * Begin occlusion query.
   */
  beginOcclusionQuery?(queryIndex: number): void;

  /**
   * End occlusion query.
   */
  endOcclusionQuery?(): void;

  /**
   * End the render pass.
   */
  end(): void;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create a simple clear color attachment.
 */
export function clearColorAttachment(view: GfxTextureView, clearColor: GfxColor = { r: 0, g: 0, b: 0, a: 1 }): GfxRenderPassColorAttachment {
  return {
    view,
    clearValue: clearColor,
    loadOp: "clear",
    storeOp: "store",
  };
}

/**
 * Create a load color attachment (preserves previous content).
 */
export function loadColorAttachment(view: GfxTextureView): GfxRenderPassColorAttachment {
  return {
    view,
    loadOp: "load",
    storeOp: "store",
  };
}

/**
 * Create a simple depth attachment.
 */
export function depthAttachment(view: GfxTextureView, clearValue: number = 1.0): GfxRenderPassDepthStencilAttachment {
  return {
    view,
    depthClearValue: clearValue,
    depthLoadOp: "clear",
    depthStoreOp: "store",
  };
}

/**
 * Color constants.
 */
export const Colors = {
  BLACK: { r: 0, g: 0, b: 0, a: 1 } satisfies GfxColor,
  WHITE: { r: 1, g: 1, b: 1, a: 1 } satisfies GfxColor,
  RED: { r: 1, g: 0, b: 0, a: 1 } satisfies GfxColor,
  GREEN: { r: 0, g: 1, b: 0, a: 1 } satisfies GfxColor,
  BLUE: { r: 0, g: 0, b: 1, a: 1 } satisfies GfxColor,
  TRANSPARENT: { r: 0, g: 0, b: 0, a: 0 } satisfies GfxColor,
} as const;
