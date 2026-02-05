/**
 * @arcanvas/gfx - Compute pass
 *
 * Compute pass encoding for dispatch commands.
 */

import type { GfxBuffer } from "../resource/buffer.js";
import type { GfxBindGroup } from "../pipeline/bindGroup.js";
import type { GfxComputePipeline } from "../pipeline/computePipeline.js";

// ============================================================================
// Compute Pass Descriptor
// ============================================================================

/**
 * Timestamp write descriptor for compute pass.
 */
export interface GfxComputePassTimestampWrites {
  /** Query set to write to */
  querySet: unknown; // GfxQuerySet when implemented
  /** Index for beginning timestamp */
  beginningOfPassWriteIndex?: number;
  /** Index for end timestamp */
  endOfPassWriteIndex?: number;
}

/**
 * Descriptor for beginning a compute pass.
 */
export interface GfxComputePassDescriptor {
  /** Debug label */
  label?: string;
  /** Timestamp writes (optional) */
  timestampWrites?: GfxComputePassTimestampWrites;
}

// ============================================================================
// Compute Pass Encoder Interface
// ============================================================================

/**
 * Compute pass encoder for recording dispatch commands.
 */
export interface GfxComputePassEncoder {
  /** Debug label */
  readonly label: string | undefined;

  /**
   * Set the current compute pipeline.
   */
  setPipeline(pipeline: GfxComputePipeline): void;

  /**
   * Set a bind group.
   */
  setBindGroup(index: number, bindGroup: GfxBindGroup | null, dynamicOffsets?: Iterable<number>): void;

  /**
   * Dispatch compute workgroups.
   */
  dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): void;

  /**
   * Dispatch compute workgroups with parameters from a buffer.
   */
  dispatchWorkgroupsIndirect(indirectBuffer: GfxBuffer, indirectOffset: number): void;

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
   * End the compute pass.
   */
  end(): void;
}
