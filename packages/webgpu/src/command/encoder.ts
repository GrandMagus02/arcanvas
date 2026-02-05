/**
 * @arcanvas/webgpu - Command Encoder Implementation
 */

import type {
  GfxCommandEncoder,
  GfxCommandEncoderDescriptor,
  GfxCommandBuffer,
  GfxRenderPassDescriptor,
  GfxRenderPassEncoder,
  GfxComputePassDescriptor,
  GfxComputePassEncoder,
  GfxBuffer,
  GfxImageCopyTexture,
  GfxImageCopyBuffer,
  GfxExtent3D,
} from "@arcanvas/gfx";
import { normalizeExtent } from "@arcanvas/gfx";
import { WebGPUBuffer } from "../resources/buffer.js";
import { WebGPUTexture, WebGPUTextureView } from "../resources/texture.js";
import { WebGPURenderPassEncoder } from "./renderPass.js";
import { WebGPUComputePassEncoder } from "./computePass.js";

/**
 * WebGPU command buffer wrapper.
 */
export class WebGPUCommandBuffer implements GfxCommandBuffer {
  private readonly _buffer: GPUCommandBuffer;
  private readonly _label: string | undefined;

  constructor(buffer: GPUCommandBuffer, label?: string) {
    this._buffer = buffer;
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU command buffer */
  get native(): GPUCommandBuffer {
    return this._buffer;
  }
}

/**
 * WebGPU command encoder wrapper.
 */
export class WebGPUCommandEncoder implements GfxCommandEncoder {
  private readonly _encoder: GPUCommandEncoder;
  private readonly _label: string | undefined;

  private constructor(encoder: GPUCommandEncoder, label?: string) {
    this._encoder = encoder;
    this._label = label;
  }

  static create(device: GPUDevice, descriptor?: GfxCommandEncoderDescriptor): WebGPUCommandEncoder {
    const gpuEncoder = device.createCommandEncoder({
      label: descriptor?.label,
    });
    return new WebGPUCommandEncoder(gpuEncoder, descriptor?.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU command encoder */
  get native(): GPUCommandEncoder {
    return this._encoder;
  }

  beginRenderPass(descriptor: GfxRenderPassDescriptor): GfxRenderPassEncoder {
    const gpuDescriptor: GPURenderPassDescriptor = {
      label: descriptor.label,
      colorAttachments: descriptor.colorAttachments.map((attachment) => {
        if (!attachment) return null;
        return {
          view: (attachment.view as WebGPUTextureView).native,
          resolveTarget: attachment.resolveTarget ? (attachment.resolveTarget as WebGPUTextureView).native : undefined,
          clearValue: attachment.clearValue,
          loadOp: attachment.loadOp,
          storeOp: attachment.storeOp,
        };
      }),
      depthStencilAttachment: descriptor.depthStencilAttachment
        ? {
            view: (descriptor.depthStencilAttachment.view as WebGPUTextureView).native,
            depthClearValue: descriptor.depthStencilAttachment.depthClearValue,
            depthLoadOp: descriptor.depthStencilAttachment.depthLoadOp,
            depthStoreOp: descriptor.depthStencilAttachment.depthStoreOp,
            depthReadOnly: descriptor.depthStencilAttachment.depthReadOnly,
            stencilClearValue: descriptor.depthStencilAttachment.stencilClearValue,
            stencilLoadOp: descriptor.depthStencilAttachment.stencilLoadOp,
            stencilStoreOp: descriptor.depthStencilAttachment.stencilStoreOp,
            stencilReadOnly: descriptor.depthStencilAttachment.stencilReadOnly,
          }
        : undefined,
      maxDrawCount: descriptor.maxDrawCount,
    };

    const gpuEncoder = this._encoder.beginRenderPass(gpuDescriptor);
    return new WebGPURenderPassEncoder(gpuEncoder, descriptor.label);
  }

  beginComputePass(descriptor?: GfxComputePassDescriptor): GfxComputePassEncoder {
    const gpuEncoder = this._encoder.beginComputePass({
      label: descriptor?.label,
    });
    return new WebGPUComputePassEncoder(gpuEncoder, descriptor?.label);
  }

  copyBufferToBuffer(source: GfxBuffer, sourceOffset: number, destination: GfxBuffer, destinationOffset: number, size: number): void {
    this._encoder.copyBufferToBuffer((source as WebGPUBuffer).native, sourceOffset, (destination as WebGPUBuffer).native, destinationOffset, size);
  }

  copyBufferToTexture(source: GfxImageCopyBuffer, destination: GfxImageCopyTexture, copySize: GfxExtent3D): void {
    const extent = normalizeExtent(copySize);
    this._encoder.copyBufferToTexture(
      {
        buffer: (source.buffer as WebGPUBuffer).native,
        offset: source.offset,
        bytesPerRow: source.bytesPerRow,
        rowsPerImage: source.rowsPerImage,
      },
      {
        texture: (destination.texture as WebGPUTexture).native,
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
      {
        width: extent.width,
        height: extent.height,
        depthOrArrayLayers: extent.depthOrArrayLayers,
      }
    );
  }

  copyTextureToBuffer(source: GfxImageCopyTexture, destination: GfxImageCopyBuffer, copySize: GfxExtent3D): void {
    const extent = normalizeExtent(copySize);
    this._encoder.copyTextureToBuffer(
      {
        texture: (source.texture as WebGPUTexture).native,
        mipLevel: source.mipLevel,
        origin: source.origin
          ? {
              x: source.origin.x ?? 0,
              y: source.origin.y ?? 0,
              z: source.origin.z ?? 0,
            }
          : undefined,
        aspect: source.aspect,
      },
      {
        buffer: (destination.buffer as WebGPUBuffer).native,
        offset: destination.offset,
        bytesPerRow: destination.bytesPerRow,
        rowsPerImage: destination.rowsPerImage,
      },
      {
        width: extent.width,
        height: extent.height,
        depthOrArrayLayers: extent.depthOrArrayLayers,
      }
    );
  }

  copyTextureToTexture(source: GfxImageCopyTexture, destination: GfxImageCopyTexture, copySize: GfxExtent3D): void {
    const extent = normalizeExtent(copySize);
    this._encoder.copyTextureToTexture(
      {
        texture: (source.texture as WebGPUTexture).native,
        mipLevel: source.mipLevel,
        origin: source.origin
          ? {
              x: source.origin.x ?? 0,
              y: source.origin.y ?? 0,
              z: source.origin.z ?? 0,
            }
          : undefined,
        aspect: source.aspect,
      },
      {
        texture: (destination.texture as WebGPUTexture).native,
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
      {
        width: extent.width,
        height: extent.height,
        depthOrArrayLayers: extent.depthOrArrayLayers,
      }
    );
  }

  clearBuffer(buffer: GfxBuffer, offset?: number, size?: number): void {
    this._encoder.clearBuffer((buffer as WebGPUBuffer).native, offset, size);
  }

  pushDebugGroup(groupLabel: string): void {
    this._encoder.pushDebugGroup(groupLabel);
  }

  popDebugGroup(): void {
    this._encoder.popDebugGroup();
  }

  insertDebugMarker(markerLabel: string): void {
    this._encoder.insertDebugMarker(markerLabel);
  }

  finish(descriptor?: { label?: string }): GfxCommandBuffer {
    const gpuBuffer = this._encoder.finish({ label: descriptor?.label });
    return new WebGPUCommandBuffer(gpuBuffer, descriptor?.label);
  }
}
