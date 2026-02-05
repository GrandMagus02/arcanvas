/**
 * @arcanvas/webgpu - Compute Pass Implementation
 */

import type { GfxComputePassEncoder, GfxComputePipeline, GfxBuffer, GfxBindGroup } from "@arcanvas/gfx";
import { WebGPUBuffer } from "../resources/buffer.js";
import { WebGPUComputePipeline } from "../pipeline/computePipeline.js";
import { WebGPUBindGroup } from "../pipeline/bindGroup.js";

/**
 * WebGPU compute pass encoder wrapper.
 */
export class WebGPUComputePassEncoder implements GfxComputePassEncoder {
  private readonly _encoder: GPUComputePassEncoder;
  private readonly _label: string | undefined;

  constructor(encoder: GPUComputePassEncoder, label?: string) {
    this._encoder = encoder;
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU compute pass encoder */
  get native(): GPUComputePassEncoder {
    return this._encoder;
  }

  setPipeline(pipeline: GfxComputePipeline): void {
    this._encoder.setPipeline((pipeline as WebGPUComputePipeline).native);
  }

  setBindGroup(index: number, bindGroup: GfxBindGroup | null, dynamicOffsets?: Iterable<number>): void {
    this._encoder.setBindGroup(index, bindGroup ? (bindGroup as WebGPUBindGroup).native : null, dynamicOffsets ? [...dynamicOffsets] : undefined);
  }

  dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): void {
    this._encoder.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);
  }

  dispatchWorkgroupsIndirect(indirectBuffer: GfxBuffer, indirectOffset: number): void {
    this._encoder.dispatchWorkgroupsIndirect((indirectBuffer as WebGPUBuffer).native, indirectOffset);
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

  end(): void {
    this._encoder.end();
  }
}
