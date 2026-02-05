/**
 * @arcanvas/gfx - Command encoder
 *
 * Command buffer encoding for GPU submission.
 */

import type { GfxBuffer } from "../resource/buffer.js";
import type { GfxImageCopyTexture, GfxImageDataLayout, GfxExtent3D } from "../resource/texture.js";
import type { GfxRenderPassDescriptor, GfxRenderPassEncoder } from "./renderPass.js";
import type { GfxComputePassDescriptor, GfxComputePassEncoder } from "./computePass.js";

// ============================================================================
// Command Encoder Descriptor
// ============================================================================

/**
 * Descriptor for creating a command encoder.
 */
export interface GfxCommandEncoderDescriptor {
  /** Debug label */
  label?: string;
}

// ============================================================================
// Copy Operations
// ============================================================================

/**
 * Buffer copy source/destination.
 */
export interface GfxImageCopyBuffer {
  /** Buffer to copy from/to */
  buffer: GfxBuffer;
  /** Byte offset in buffer */
  offset?: number;
  /** Bytes per row */
  bytesPerRow?: number;
  /** Rows per image (for 3D/array textures) */
  rowsPerImage?: number;
}

// ============================================================================
// Command Encoder Interface
// ============================================================================

/**
 * Command encoder for recording GPU commands.
 */
export interface GfxCommandEncoder {
  /** Debug label */
  readonly label: string | undefined;

  /**
   * Begin a render pass.
   */
  beginRenderPass(descriptor: GfxRenderPassDescriptor): GfxRenderPassEncoder;

  /**
   * Begin a compute pass.
   */
  beginComputePass(descriptor?: GfxComputePassDescriptor): GfxComputePassEncoder;

  // Buffer copies
  /**
   * Copy data between buffers.
   */
  copyBufferToBuffer(source: GfxBuffer, sourceOffset: number, destination: GfxBuffer, destinationOffset: number, size: number): void;

  // Texture copies
  /**
   * Copy buffer to texture.
   */
  copyBufferToTexture(source: GfxImageCopyBuffer, destination: GfxImageCopyTexture, copySize: GfxExtent3D): void;

  /**
   * Copy texture to buffer.
   */
  copyTextureToBuffer(source: GfxImageCopyTexture, destination: GfxImageCopyBuffer, copySize: GfxExtent3D): void;

  /**
   * Copy texture to texture.
   */
  copyTextureToTexture(source: GfxImageCopyTexture, destination: GfxImageCopyTexture, copySize: GfxExtent3D): void;

  // Buffer operations
  /**
   * Clear a buffer region to zero.
   */
  clearBuffer(buffer: GfxBuffer, offset?: number, size?: number): void;

  // Query operations
  /**
   * Resolve query results to a buffer.
   */
  resolveQuerySet?(querySet: unknown, firstQuery: number, queryCount: number, destination: GfxBuffer, destinationOffset: number): void;

  /**
   * Write a timestamp.
   */
  writeTimestamp?(querySet: unknown, queryIndex: number): void;

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

  /**
   * Finish encoding and return the command buffer.
   */
  finish(descriptor?: { label?: string }): GfxCommandBuffer;
}

// ============================================================================
// Command Buffer Interface
// ============================================================================

/**
 * Opaque command buffer handle.
 * Command buffers are single-use and cannot be reused after submission.
 */
export interface GfxCommandBuffer {
  /** Debug label */
  readonly label: string | undefined;
}

// ============================================================================
// Queue Interface
// ============================================================================

/**
 * GPU command queue for submission and data upload.
 */
export interface GfxQueue {
  /** Debug label */
  readonly label: string | undefined;

  /**
   * Submit command buffers for execution.
   */
  submit(commandBuffers: GfxCommandBuffer[]): void;

  /**
   * Write data to a buffer immediately.
   * More efficient than mapping for small updates.
   */
  writeBuffer(buffer: GfxBuffer, bufferOffset: number, data: BufferSource, dataOffset?: number, size?: number): void;

  /**
   * Write data to a texture immediately.
   */
  writeTexture(destination: GfxImageCopyTexture, data: BufferSource, dataLayout: GfxImageDataLayout, size: GfxExtent3D): void;

  /**
   * Signal when all submitted work completes.
   */
  onSubmittedWorkDone(): Promise<void>;
}
