/**
 * @arcanvas/webgpu - Shader Module Implementation
 */

import type { GfxShaderModule, GfxShaderModuleDescriptor, ShaderCompilationMessage } from "@arcanvas/gfx";
import { findShaderSource, GfxShaderError } from "@arcanvas/gfx";

/**
 * WebGPU shader module wrapper.
 */
export class WebGPUShaderModule implements GfxShaderModule {
  private readonly _module: GPUShaderModule;
  private readonly _label: string | undefined;

  private constructor(module: GPUShaderModule, label?: string) {
    this._module = module;
    this._label = label;
  }

  static create(device: GPUDevice, descriptor: GfxShaderModuleDescriptor): WebGPUShaderModule {
    // Find WGSL source (WebGPU only accepts WGSL)
    const wgslSource = findShaderSource(descriptor.sources, "wgsl");

    if (!wgslSource) {
      throw new GfxShaderError("WebGPU requires WGSL shader source. No WGSL source found in shader descriptor.", { details: { providedKinds: descriptor.sources.map((s) => s.kind) } });
    }

    const gpuModule = device.createShaderModule({
      label: descriptor.label,
      code: wgslSource.code,
      // Note: sourceMap is not part of the standard WebGPU API
      compilationHints: descriptor.hints?.layout?.map((h) => ({
        entryPoint: h.entryPoint,
        layout: h.bindGroupLayouts ? "auto" : undefined,
      })),
    });

    return new WebGPUShaderModule(gpuModule, descriptor.label);
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU shader module */
  get native(): GPUShaderModule {
    return this._module;
  }

  async getCompilationInfo(): Promise<ShaderCompilationMessage[]> {
    const info = await this._module.getCompilationInfo();

    return info.messages.map((msg) => ({
      message: msg.message,
      type: msg.type,
      lineNum: msg.lineNum,
      linePos: msg.linePos,
      offset: msg.offset,
      length: msg.length,
    }));
  }
}
