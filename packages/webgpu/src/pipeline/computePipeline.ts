/**
 * @arcanvas/webgpu - Compute Pipeline Implementation
 */

import type { GfxComputePipeline, GfxComputePipelineDescriptor, GfxBindGroupLayout } from "@arcanvas/gfx";
import { WebGPUShaderModule } from "./shader.js";
import { WebGPUPipelineLayout } from "./bindGroup.js";

/**
 * WebGPU compute pipeline wrapper.
 */
export class WebGPUComputePipeline implements GfxComputePipeline {
  private readonly _pipeline: GPUComputePipeline;
  private readonly _label: string | undefined;
  private readonly _isAutoLayout: boolean;

  private constructor(pipeline: GPUComputePipeline, label?: string, isAutoLayout = false) {
    this._pipeline = pipeline;
    this._label = label;
    this._isAutoLayout = isAutoLayout;
  }

  static create(device: GPUDevice, descriptor: GfxComputePipelineDescriptor): WebGPUComputePipeline {
    const computeModule = (descriptor.compute.module as WebGPUShaderModule).native;

    const gpuDescriptor: GPUComputePipelineDescriptor = {
      label: descriptor.label,
      layout: descriptor.layout === "auto" ? "auto" : (descriptor.layout as WebGPUPipelineLayout).native,
      compute: {
        module: computeModule,
        entryPoint: descriptor.compute.entryPoint,
        constants: descriptor.compute.constants,
      },
    };

    const pipeline = device.createComputePipeline(gpuDescriptor);
    return new WebGPUComputePipeline(pipeline, descriptor.label, descriptor.layout === "auto");
  }

  static async createAsync(device: GPUDevice, descriptor: GfxComputePipelineDescriptor): Promise<WebGPUComputePipeline> {
    const computeModule = (descriptor.compute.module as WebGPUShaderModule).native;

    const gpuDescriptor: GPUComputePipelineDescriptor = {
      label: descriptor.label,
      layout: descriptor.layout === "auto" ? "auto" : (descriptor.layout as WebGPUPipelineLayout).native,
      compute: {
        module: computeModule,
        entryPoint: descriptor.compute.entryPoint,
        constants: descriptor.compute.constants,
      },
    };

    const pipeline = await device.createComputePipelineAsync(gpuDescriptor);
    return new WebGPUComputePipeline(pipeline, descriptor.label, descriptor.layout === "auto");
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU compute pipeline */
  get native(): GPUComputePipeline {
    return this._pipeline;
  }

  getBindGroupLayout(groupIndex: number): GfxBindGroupLayout {
    if (!this._isAutoLayout) {
      throw new Error("getBindGroupLayout is only available for pipelines created with layout: 'auto'");
    }

    const gpuLayout = this._pipeline.getBindGroupLayout(groupIndex);
    return {
      label: undefined,
      native: gpuLayout,
    } as unknown as GfxBindGroupLayout;
  }
}
