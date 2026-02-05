/**
 * @arcanvas/gfx - Buffer resource
 *
 * GPU buffer for vertex, index, uniform, and storage data.
 */

import type { BufferUsageFlags } from "../types/usages.js";

// ============================================================================
// Buffer Descriptor
// ============================================================================

/**
 * Descriptor for creating a GPU buffer.
 */
export interface GfxBufferDescriptor {
  /** Debug label for the buffer */
  label?: string;
  /** Size in bytes */
  size: number;
  /** Usage flags (combine with | operator) */
  usage: BufferUsageFlags;
  /** If true, buffer starts mapped for writing */
  mappedAtCreation?: boolean;
}

// ============================================================================
// Buffer Interface
// ============================================================================

/**
 * Opaque GPU buffer handle.
 *
 * Buffers hold vertex data, index data, uniform data, or storage data.
 * The actual GPU resource is managed by the backend.
 */
export interface GfxBuffer {
  /** Debug label */
  readonly label: string | undefined;
  /** Buffer size in bytes */
  readonly size: number;
  /** Usage flags this buffer was created with */
  readonly usage: BufferUsageFlags;

  /**
   * Map the buffer for CPU access.
   * Only valid for buffers created with MAP_READ or MAP_WRITE usage.
   *
   * @param mode - Map mode (READ, WRITE, or READ | WRITE)
   * @param offset - Byte offset to start mapping (default: 0)
   * @param size - Number of bytes to map (default: entire buffer)
   * @returns Promise that resolves when mapping is complete
   */
  mapAsync(mode: number, offset?: number, size?: number): Promise<void>;

  /**
   * Get a mapped range for reading/writing.
   * Buffer must be mapped first.
   *
   * @param offset - Byte offset (default: 0)
   * @param size - Number of bytes (default: entire mapped range)
   * @returns ArrayBuffer view of the mapped range
   */
  getMappedRange(offset?: number, size?: number): ArrayBuffer;

  /**
   * Unmap the buffer, making it available for GPU operations again.
   */
  unmap(): void;

  /**
   * Destroy the buffer and release GPU resources.
   */
  destroy(): void;
}

// ============================================================================
// Buffer Write Operation
// ============================================================================

/**
 * Options for writing data to a buffer.
 */
export interface BufferWriteOptions {
  /** Byte offset in the buffer to write to */
  bufferOffset?: number;
  /** Byte offset in the source data to read from */
  dataOffset?: number;
  /** Number of bytes to write (default: entire source) */
  size?: number;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Calculate aligned size for uniform buffers.
 * WebGPU requires uniform buffer bindings to be 256-byte aligned.
 *
 * @param size - Unaligned size in bytes
 * @param alignment - Alignment requirement (default: 256)
 * @returns Aligned size
 */
export function alignBufferSize(size: number, alignment: number = 256): number {
  return Math.ceil(size / alignment) * alignment;
}

/**
 * Create a typed array view of buffer data.
 */
export function createBufferView<T extends ArrayBufferView>(
  buffer: ArrayBuffer,
  ctor: new (buffer: ArrayBuffer, byteOffset?: number, length?: number) => T,
  byteOffset: number = 0,
  length?: number
): T {
  return new ctor(buffer, byteOffset, length);
}
