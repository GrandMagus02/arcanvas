/**
 * @arcanvas/webgpu - Bind Group Implementation
 */

import type { GfxBindGroupLayout, GfxBindGroupLayoutDescriptor, GfxBindGroup, GfxBindGroupDescriptor, GfxPipelineLayout, GfxPipelineLayoutDescriptor, GfxBindGroupEntry } from "@arcanvas/gfx";
import { isBufferBinding } from "@arcanvas/gfx";
import { WebGPUBuffer } from "../resources/buffer.js";
import { WebGPUSampler } from "../resources/sampler.js";
import { WebGPUTextureView } from "../resources/texture.js";

/**
 * WebGPU bind group layout wrapper.
 */
export class WebGPUBindGroupLayout implements GfxBindGroupLayout {
  private readonly _layout: GPUBindGroupLayout;
  private readonly _label: string | undefined;

  private constructor(layout: GPUBindGroupLayout, label?: string) {
    this._layout = layout;
    this._label = label;
  }

  static create(device: GPUDevice, descriptor: GfxBindGroupLayoutDescriptor): WebGPUBindGroupLayout {
    const gpuLayout = device.createBindGroupLayout({
      label: descriptor.label,
      entries: descriptor.entries.map((entry) => {
        const gpuEntry: GPUBindGroupLayoutEntry = {
          binding: entry.binding,
          visibility: entry.visibility,
        };

        if (entry.buffer) {
          gpuEntry.buffer = {
            type: entry.buffer.type,
            hasDynamicOffset: entry.buffer.hasDynamicOffset,
            minBindingSize: entry.buffer.minBindingSize,
          };
        }

        if (entry.sampler) {
          gpuEntry.sampler = {
            type: entry.sampler.type,
          };
        }

        if (entry.texture) {
          gpuEntry.texture = {
            sampleType: entry.texture.sampleType,
            viewDimension: entry.texture.viewDimension as GPUTextureViewDimension | undefined,
            multisampled: entry.texture.multisampled,
          };
        }

        if (entry.storageTexture) {
          gpuEntry.storageTexture = {
            access: entry.storageTexture.access,
            format: entry.storageTexture.format as GPUTextureFormat,
            viewDimension: entry.storageTexture.viewDimension as GPUTextureViewDimension | undefined,
          };
        }

        return gpuEntry;
      }),
    });

    return new WebGPUBindGroupLayout(gpuLayout, descriptor.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU bind group layout */
  get native(): GPUBindGroupLayout {
    return this._layout;
  }
}

/**
 * WebGPU bind group wrapper.
 */
export class WebGPUBindGroup implements GfxBindGroup {
  private readonly _bindGroup: GPUBindGroup;
  private readonly _layout: GfxBindGroupLayout;
  private readonly _label: string | undefined;

  private constructor(bindGroup: GPUBindGroup, layout: GfxBindGroupLayout, label?: string) {
    this._bindGroup = bindGroup;
    this._layout = layout;
    this._label = label;
  }

  static create(device: GPUDevice, descriptor: GfxBindGroupDescriptor): WebGPUBindGroup {
    const layoutNative = (descriptor.layout as WebGPUBindGroupLayout).native;

    const gpuBindGroup = device.createBindGroup({
      label: descriptor.label,
      layout: layoutNative,
      entries: descriptor.entries.map((entry) => ({
        binding: entry.binding,
        resource: WebGPUBindGroup.convertResource(entry),
      })),
    });

    return new WebGPUBindGroup(gpuBindGroup, descriptor.layout, descriptor.label);
  }

  private static convertResource(entry: GfxBindGroupEntry): GPUBindingResource {
    const resource = entry.resource;

    if (isBufferBinding(resource)) {
      return {
        buffer: (resource.buffer as WebGPUBuffer).native,
        offset: resource.offset,
        size: resource.size,
      };
    }

    if (resource instanceof WebGPUSampler || ("native" in resource && resource.native instanceof GPUSampler)) {
      return (resource as WebGPUSampler).native;
    }

    if (resource instanceof WebGPUTextureView || ("native" in resource && resource.native instanceof GPUTextureView)) {
      return (resource as WebGPUTextureView).native;
    }

    // Fallback - assume it has a native property
    if ("native" in resource) {
      return (resource as { native: GPUBindingResource }).native;
    }

    throw new Error(`Unknown resource type in bind group entry ${entry.binding}`);
  }

  get label(): string | undefined {
    return this._label;
  }

  get layout(): GfxBindGroupLayout {
    return this._layout;
  }

  /** Get the underlying WebGPU bind group */
  get native(): GPUBindGroup {
    return this._bindGroup;
  }
}

/**
 * WebGPU pipeline layout wrapper.
 */
export class WebGPUPipelineLayout implements GfxPipelineLayout {
  private readonly _layout: GPUPipelineLayout;
  private readonly _label: string | undefined;

  private constructor(layout: GPUPipelineLayout, label?: string) {
    this._layout = layout;
    this._label = label;
  }

  static create(device: GPUDevice, descriptor: GfxPipelineLayoutDescriptor): WebGPUPipelineLayout {
    const gpuLayout = device.createPipelineLayout({
      label: descriptor.label,
      bindGroupLayouts: descriptor.bindGroupLayouts.map((l) => (l as WebGPUBindGroupLayout).native),
    });

    return new WebGPUPipelineLayout(gpuLayout, descriptor.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU pipeline layout */
  get native(): GPUPipelineLayout {
    return this._layout;
  }
}
