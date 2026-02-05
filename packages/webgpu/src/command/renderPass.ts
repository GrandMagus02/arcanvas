/**
 * @arcanvas/webgpu - Render Pass Implementation
 */

import type { GfxRenderPassEncoder, GfxRenderPipeline, GfxBuffer, GfxBindGroup, GfxColor, IndexFormat } from "@arcanvas/gfx";
import { WebGPUBuffer } from "../resources/buffer.js";
import { WebGPURenderPipeline } from "../pipeline/renderPipeline.js";
import { WebGPUBindGroup } from "../pipeline/bindGroup.js";

/**
 * WebGPU render pass encoder wrapper.
 */
export class WebGPURenderPassEncoder implements GfxRenderPassEncoder {
  private readonly _encoder: GPURenderPassEncoder;
  private readonly _label: string | undefined;

  constructor(encoder: GPURenderPassEncoder, label?: string) {
    this._encoder = encoder;
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  /** Get the underlying WebGPU render pass encoder */
  get native(): GPURenderPassEncoder {
    return this._encoder;
  }

  setPipeline(pipeline: GfxRenderPipeline): void {
    this._encoder.setPipeline((pipeline as WebGPURenderPipeline).native);
  }

  setVertexBuffer(slot: number, buffer: GfxBuffer | null, offset?: number, size?: number): void {
    this._encoder.setVertexBuffer(slot, buffer ? (buffer as WebGPUBuffer).native : null, offset, size);
  }

  setIndexBuffer(buffer: GfxBuffer, format: IndexFormat, offset?: number, size?: number): void {
    this._encoder.setIndexBuffer((buffer as WebGPUBuffer).native, format as GPUIndexFormat, offset, size);
  }

  setBindGroup(index: number, bindGroup: GfxBindGroup | null, dynamicOffsets?: Iterable<number>): void {
    this._encoder.setBindGroup(index, bindGroup ? (bindGroup as WebGPUBindGroup).native : null, dynamicOffsets ? [...dynamicOffsets] : undefined);
  }

  draw(vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void {
    this._encoder.draw(vertexCount, instanceCount, firstVertex, firstInstance);
  }

  drawIndexed(indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void {
    this._encoder.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
  }

  drawIndirect(indirectBuffer: GfxBuffer, indirectOffset: number): void {
    this._encoder.drawIndirect((indirectBuffer as WebGPUBuffer).native, indirectOffset);
  }

  drawIndexedIndirect(indirectBuffer: GfxBuffer, indirectOffset: number): void {
    this._encoder.drawIndexedIndirect((indirectBuffer as WebGPUBuffer).native, indirectOffset);
  }

  setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number): void {
    this._encoder.setViewport(x, y, width, height, minDepth, maxDepth);
  }

  setScissorRect(x: number, y: number, width: number, height: number): void {
    this._encoder.setScissorRect(x, y, width, height);
  }

  setBlendConstant(color: GfxColor): void {
    this._encoder.setBlendConstant(color);
  }

  setStencilReference(reference: number): void {
    this._encoder.setStencilReference(reference);
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

  beginOcclusionQuery(queryIndex: number): void {
    this._encoder.beginOcclusionQuery(queryIndex);
  }

  endOcclusionQuery(): void {
    this._encoder.endOcclusionQuery();
  }

  end(): void {
    this._encoder.end();
  }
}
