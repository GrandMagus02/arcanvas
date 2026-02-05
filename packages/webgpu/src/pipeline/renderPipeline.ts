/**
 * @arcanvas/webgpu - Render Pipeline Implementation
 */

import type { GfxRenderPipeline, GfxRenderPipelineDescriptor, GfxBindGroupLayout } from "@arcanvas/gfx";
import { WebGPUShaderModule } from "./shader.js";
import { WebGPUPipelineLayout } from "./bindGroup.js";

/**
 * WebGPU render pipeline wrapper.
 */
export class WebGPURenderPipeline implements GfxRenderPipeline {
  private readonly _pipeline: GPURenderPipeline;
  private readonly _label: string | undefined;
  private readonly _isAutoLayout: boolean;

  private constructor(pipeline: GPURenderPipeline, label?: string, isAutoLayout = false) {
    this._pipeline = pipeline;
    this._label = label;
    this._isAutoLayout = isAutoLayout;
  }

  static create(device: GPUDevice, descriptor: GfxRenderPipelineDescriptor): WebGPURenderPipeline {
    const gpuDescriptor = WebGPURenderPipeline.convertDescriptor(descriptor);
    const pipeline = device.createRenderPipeline(gpuDescriptor);
    return new WebGPURenderPipeline(pipeline, descriptor.label, descriptor.layout === "auto");
  }

  static async createAsync(device: GPUDevice, descriptor: GfxRenderPipelineDescriptor): Promise<WebGPURenderPipeline> {
    const gpuDescriptor = WebGPURenderPipeline.convertDescriptor(descriptor);
    const pipeline = await device.createRenderPipelineAsync(gpuDescriptor);
    return new WebGPURenderPipeline(pipeline, descriptor.label, descriptor.layout === "auto");
  }

  private static convertDescriptor(descriptor: GfxRenderPipelineDescriptor): GPURenderPipelineDescriptor {
    const vertexModule = (descriptor.vertex.module as WebGPUShaderModule).native;

    const gpuDescriptor: GPURenderPipelineDescriptor = {
      label: descriptor.label,
      layout: descriptor.layout === "auto" ? "auto" : (descriptor.layout as WebGPUPipelineLayout).native,
      vertex: {
        module: vertexModule,
        entryPoint: descriptor.vertex.entryPoint,
        constants: descriptor.vertex.constants,
        buffers: descriptor.vertex.buffers?.map((buf) => ({
          arrayStride: buf.arrayStride,
          stepMode: buf.stepMode,
          attributes: buf.attributes.map((attr) => ({
            format: attr.format as GPUVertexFormat,
            offset: attr.offset,
            shaderLocation: attr.shaderLocation,
          })),
        })),
      },
    };

    if (descriptor.fragment) {
      const fragmentModule = (descriptor.fragment.module as WebGPUShaderModule).native;
      gpuDescriptor.fragment = {
        module: fragmentModule,
        entryPoint: descriptor.fragment.entryPoint,
        constants: descriptor.fragment.constants,
        targets: descriptor.fragment.targets.map((target) => {
          if (!target) return null;
          return {
            format: target.format as GPUTextureFormat,
            blend: target.blend
              ? {
                  color: {
                    srcFactor: target.blend.color.srcFactor as GPUBlendFactor | undefined,
                    dstFactor: target.blend.color.dstFactor as GPUBlendFactor | undefined,
                    operation: target.blend.color.operation as GPUBlendOperation | undefined,
                  },
                  alpha: {
                    srcFactor: target.blend.alpha.srcFactor as GPUBlendFactor | undefined,
                    dstFactor: target.blend.alpha.dstFactor as GPUBlendFactor | undefined,
                    operation: target.blend.alpha.operation as GPUBlendOperation | undefined,
                  },
                }
              : undefined,
            writeMask: target.writeMask,
          };
        }),
      };
    }

    if (descriptor.primitive) {
      gpuDescriptor.primitive = {
        topology: descriptor.primitive.topology as GPUPrimitiveTopology | undefined,
        stripIndexFormat: descriptor.primitive.stripIndexFormat as GPUIndexFormat | undefined,
        frontFace: descriptor.primitive.frontFace,
        cullMode: descriptor.primitive.cullMode,
        unclippedDepth: descriptor.primitive.unclippedDepth,
      };
    }

    if (descriptor.depthStencil) {
      gpuDescriptor.depthStencil = {
        format: descriptor.depthStencil.format as GPUTextureFormat,
        depthWriteEnabled: descriptor.depthStencil.depthWriteEnabled,
        depthCompare: descriptor.depthStencil.depthCompare as GPUCompareFunction | undefined,
        stencilFront: descriptor.depthStencil.stencilFront
          ? {
              compare: descriptor.depthStencil.stencilFront.compare as GPUCompareFunction | undefined,
              failOp: descriptor.depthStencil.stencilFront.failOp as GPUStencilOperation | undefined,
              depthFailOp: descriptor.depthStencil.stencilFront.depthFailOp as GPUStencilOperation | undefined,
              passOp: descriptor.depthStencil.stencilFront.passOp as GPUStencilOperation | undefined,
            }
          : undefined,
        stencilBack: descriptor.depthStencil.stencilBack
          ? {
              compare: descriptor.depthStencil.stencilBack.compare as GPUCompareFunction | undefined,
              failOp: descriptor.depthStencil.stencilBack.failOp as GPUStencilOperation | undefined,
              depthFailOp: descriptor.depthStencil.stencilBack.depthFailOp as GPUStencilOperation | undefined,
              passOp: descriptor.depthStencil.stencilBack.passOp as GPUStencilOperation | undefined,
            }
          : undefined,
        stencilReadMask: descriptor.depthStencil.stencilReadMask,
        stencilWriteMask: descriptor.depthStencil.stencilWriteMask,
        depthBias: descriptor.depthStencil.depthBias,
        depthBiasSlopeScale: descriptor.depthStencil.depthBiasSlopeScale,
        depthBiasClamp: descriptor.depthStencil.depthBiasClamp,
      };
    }

    if (descriptor.multisample) {
      gpuDescriptor.multisample = {
        count: descriptor.multisample.count,
        mask: descriptor.multisample.mask,
        alphaToCoverageEnabled: descriptor.multisample.alphaToCoverageEnabled,
      };
    }

    return gpuDescriptor;
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU render pipeline */
  get native(): GPURenderPipeline {
    return this._pipeline;
  }

  getBindGroupLayout(groupIndex: number): GfxBindGroupLayout {
    if (!this._isAutoLayout) {
      throw new Error("getBindGroupLayout is only available for pipelines created with layout: 'auto'");
    }

    const gpuLayout = this._pipeline.getBindGroupLayout(groupIndex);
    // Wrap in our type - note: this is a simplified wrapper
    // In practice, you'd want to cache these
    return {
      label: undefined,
      native: gpuLayout,
    } as unknown as GfxBindGroupLayout;
  }
}
