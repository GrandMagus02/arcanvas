/**
 * @arcanvas/webgpu - Texture Implementation
 */

import type { GfxTexture, GfxTextureView, GfxTextureDescriptor, GfxTextureViewDescriptor, TextureDimension, TextureFormat, TextureUsageFlags } from "@arcanvas/gfx";
import { normalizeExtent } from "@arcanvas/gfx";

/**
 * WebGPU texture view wrapper.
 */
export class WebGPUTextureView implements GfxTextureView {
  private readonly _view: GPUTextureView;
  private readonly _texture: GfxTexture;

  constructor(view: GPUTextureView, texture: GfxTexture) {
    this._view = view;
    this._texture = texture;
  }

  get label(): string | undefined {
    return this._view.label || undefined;
  }

  get texture(): GfxTexture {
    return this._texture;
  }

  /** Get the underlying WebGPU texture view */
  get native(): GPUTextureView {
    return this._view;
  }
}

/**
 * WebGPU texture wrapper.
 */
export class WebGPUTexture implements GfxTexture {
  private readonly _texture: GPUTexture;
  private readonly _descriptor: Required<{
    width: number;
    height: number;
    depthOrArrayLayers: number;
    mipLevelCount: number;
    sampleCount: number;
    dimension: TextureDimension;
    format: TextureFormat;
    usage: TextureUsageFlags;
  }>;

  private constructor(texture: GPUTexture, descriptor: GfxTextureDescriptor) {
    this._texture = texture;
    const extent = normalizeExtent(descriptor.size);
    this._descriptor = {
      width: extent.width,
      height: extent.height,
      depthOrArrayLayers: extent.depthOrArrayLayers,
      mipLevelCount: descriptor.mipLevelCount ?? 1,
      sampleCount: descriptor.sampleCount ?? 1,
      dimension: descriptor.dimension ?? "2d",
      format: descriptor.format,
      usage: descriptor.usage,
    };
  }

  static create(device: GPUDevice, descriptor: GfxTextureDescriptor): WebGPUTexture {
    const extent = normalizeExtent(descriptor.size);

    const gpuTexture = device.createTexture({
      label: descriptor.label,
      size: {
        width: extent.width,
        height: extent.height,
        depthOrArrayLayers: extent.depthOrArrayLayers,
      },
      mipLevelCount: descriptor.mipLevelCount,
      sampleCount: descriptor.sampleCount,
      dimension: descriptor.dimension,
      format: descriptor.format as GPUTextureFormat,
      usage: descriptor.usage,
      viewFormats: descriptor.viewFormats as GPUTextureFormat[] | undefined,
    });

    return new WebGPUTexture(gpuTexture, descriptor);
  }

  get label(): string | undefined {
    return this._texture.label || undefined;
  }

  get width(): number {
    return this._descriptor.width;
  }

  get height(): number {
    return this._descriptor.height;
  }

  get depthOrArrayLayers(): number {
    return this._descriptor.depthOrArrayLayers;
  }

  get mipLevelCount(): number {
    return this._descriptor.mipLevelCount;
  }

  get sampleCount(): number {
    return this._descriptor.sampleCount;
  }

  get dimension(): TextureDimension {
    return this._descriptor.dimension;
  }

  get format(): TextureFormat {
    return this._descriptor.format;
  }

  get usage(): TextureUsageFlags {
    return this._descriptor.usage;
  }

  /** Get the underlying WebGPU texture */
  get native(): GPUTexture {
    return this._texture;
  }

  createView(descriptor?: GfxTextureViewDescriptor): GfxTextureView {
    const gpuView = this._texture.createView({
      label: descriptor?.label,
      format: descriptor?.format as GPUTextureFormat | undefined,
      dimension: descriptor?.dimension as GPUTextureViewDimension | undefined,
      aspect: descriptor?.aspect,
      baseMipLevel: descriptor?.baseMipLevel,
      mipLevelCount: descriptor?.mipLevelCount,
      baseArrayLayer: descriptor?.baseArrayLayer,
      arrayLayerCount: descriptor?.arrayLayerCount,
    });

    return new WebGPUTextureView(gpuView, this);
  }

  destroy(): void {
    this._texture.destroy();
  }
}
