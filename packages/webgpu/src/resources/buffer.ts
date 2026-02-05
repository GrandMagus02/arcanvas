/**
 * @arcanvas/webgpu - Buffer Implementation
 */

import type { GfxBuffer, GfxBufferDescriptor, BufferUsageFlags } from "@arcanvas/gfx";

/**
 * WebGPU buffer wrapper.
 */
export class WebGPUBuffer implements GfxBuffer {
  private readonly _buffer: GPUBuffer;
  private readonly _size: number;
  private readonly _usage: BufferUsageFlags;

  private constructor(buffer: GPUBuffer, size: number, usage: BufferUsageFlags) {
    this._buffer = buffer;
    this._size = size;
    this._usage = usage;
  }

  static create(device: GPUDevice, descriptor: GfxBufferDescriptor): WebGPUBuffer {
    const gpuBuffer = device.createBuffer({
      label: descriptor.label,
      size: descriptor.size,
      usage: descriptor.usage,
      mappedAtCreation: descriptor.mappedAtCreation,
    });

    return new WebGPUBuffer(gpuBuffer, descriptor.size, descriptor.usage);
  }

  get label(): string | undefined {
    return this._buffer.label || undefined;
  }

  get size(): number {
    return this._size;
  }

  get usage(): BufferUsageFlags {
    return this._usage;
  }

  /** Get the underlying WebGPU buffer */
  get native(): GPUBuffer {
    return this._buffer;
  }

  async mapAsync(mode: number, offset?: number, size?: number): Promise<void> {
    await this._buffer.mapAsync(mode, offset, size);
  }

  getMappedRange(offset?: number, size?: number): ArrayBuffer {
    return this._buffer.getMappedRange(offset, size);
  }

  unmap(): void {
    this._buffer.unmap();
  }

  destroy(): void {
    this._buffer.destroy();
  }
}
