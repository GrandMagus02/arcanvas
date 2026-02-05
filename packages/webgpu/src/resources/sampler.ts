/**
 * @arcanvas/webgpu - Sampler Implementation
 */

import type { GfxSampler, GfxSamplerDescriptor } from "@arcanvas/gfx";

/**
 * WebGPU sampler wrapper.
 */
export class WebGPUSampler implements GfxSampler {
  private readonly _sampler: GPUSampler;
  private readonly _label: string | undefined;

  private constructor(sampler: GPUSampler, label?: string) {
    this._sampler = sampler;
    this._label = label;
  }

  static create(device: GPUDevice, descriptor?: GfxSamplerDescriptor): WebGPUSampler {
    const gpuSampler = device.createSampler({
      label: descriptor?.label,
      addressModeU: descriptor?.addressModeU,
      addressModeV: descriptor?.addressModeV,
      addressModeW: descriptor?.addressModeW,
      magFilter: descriptor?.magFilter,
      minFilter: descriptor?.minFilter,
      mipmapFilter: descriptor?.mipmapFilter,
      lodMinClamp: descriptor?.lodMinClamp,
      lodMaxClamp: descriptor?.lodMaxClamp,
      compare: descriptor?.compare,
      maxAnisotropy: descriptor?.maxAnisotropy,
    });

    return new WebGPUSampler(gpuSampler, descriptor?.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU sampler */
  get native(): GPUSampler {
    return this._sampler;
  }
}
