/**
 * @arcanvas/webgpu - Queue Implementation
 */

import type { GfxQueue, GfxCommandBuffer, GfxImageCopyTexture, GfxImageDataLayout, GfxExtent3D, GfxBuffer } from "@arcanvas/gfx";
import { normalizeExtent } from "@arcanvas/gfx";
import { WebGPUBuffer } from "../resources/buffer.js";
import { WebGPUTexture } from "../resources/texture.js";
import type { WebGPUCommandBuffer } from "./encoder.js";

/**
 * WebGPU queue wrapper.
 */
export class WebGPUQueue implements GfxQueue {
  private readonly _queue: GPUQueue;

  constructor(queue: GPUQueue) {
    this._queue = queue;
  }

  get label(): string | undefined {
    return this._queue.label || undefined;
  }

  /** Get the underlying WebGPU queue */
  get native(): GPUQueue {
    return this._queue;
  }

  submit(commandBuffers: GfxCommandBuffer[]): void {
    const gpuBuffers = commandBuffers.map((cb) => (cb as WebGPUCommandBuffer).native);
    this._queue.submit(gpuBuffers);
  }

  writeBuffer(buffer: GfxBuffer, bufferOffset: number, data: BufferSource, dataOffset?: number, size?: number): void {
    const gpuBuffer = (buffer as WebGPUBuffer).native;
    this._queue.writeBuffer(gpuBuffer, bufferOffset, data, dataOffset, size);
  }

  writeTexture(destination: GfxImageCopyTexture, data: BufferSource, dataLayout: GfxImageDataLayout, size: GfxExtent3D): void {
    const gpuTexture = (destination.texture as WebGPUTexture).native;
    const extent = normalizeExtent(size);

    this._queue.writeTexture(
      {
        texture: gpuTexture,
        mipLevel: destination.mipLevel,
        origin: destination.origin
          ? {
              x: destination.origin.x ?? 0,
              y: destination.origin.y ?? 0,
              z: destination.origin.z ?? 0,
            }
          : undefined,
        aspect: destination.aspect,
      },
      data,
      {
        offset: dataLayout.offset,
        bytesPerRow: dataLayout.bytesPerRow,
        rowsPerImage: dataLayout.rowsPerImage,
      },
      {
        width: extent.width,
        height: extent.height,
        depthOrArrayLayers: extent.depthOrArrayLayers,
      }
    );
  }

  async onSubmittedWorkDone(): Promise<void> {
    await this._queue.onSubmittedWorkDone();
  }
}
