/**
 * @arcanvas/webgl2 - WebGL2 Render Pass Implementation
 *
 * WebGL2 doesn't have explicit render passes. We emulate them by:
 * - Recording commands
 * - Executing them when the pass ends
 */

import type { GfxRenderPassEncoder, GfxRenderPassDescriptor, GfxRenderPipeline, GfxBuffer, GfxBindGroup, IndexFormat, GfxColor } from "@arcanvas/gfx";
import { getGLIndexType, getGLVertexFormat } from "../constants.js";
import type { WebGL2RenderPipeline } from "../pipeline/renderPipeline.js";
import type { WebGL2Buffer } from "../resources/buffer.js";
import type { WebGL2BindGroup } from "../pipeline/bindGroup.js";

/**
 * WebGL2 render pass encoder.
 *
 * Records commands and executes them immediately (WebGL is immediate mode).
 */
export class WebGL2RenderPassEncoder implements GfxRenderPassEncoder {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _descriptor: GfxRenderPassDescriptor;
  private readonly _label: string | undefined;

  private _currentPipeline: WebGL2RenderPipeline | null = null;
  private _currentIndexBuffer: WebGL2Buffer | null = null;
  private _currentIndexFormat: IndexFormat = "uint16";
  private _currentIndexOffset = 0;
  private _vertexBuffers: Map<number, { buffer: WebGL2Buffer; offset: number }> = new Map();
  private _vao: WebGLVertexArrayObject | null = null;
  private _ended = false;

  constructor(gl: WebGL2RenderingContext, descriptor: GfxRenderPassDescriptor) {
    this._gl = gl;
    this._descriptor = descriptor;
    this._label = descriptor.label;

    // Begin the render pass
    this.beginPass();
  }

  private beginPass(): void {
    const gl = this._gl;

    // Set up framebuffer
    // For now, we render to the default framebuffer (canvas)
    // TODO: Support render targets (FBOs)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Handle color attachments
    for (const colorAttachment of this._descriptor.colorAttachments) {
      if (!colorAttachment) continue;

      // Clear if requested
      if (colorAttachment.loadOp === "clear" && colorAttachment.clearValue) {
        const c = colorAttachment.clearValue;
        gl.clearColor(c.r, c.g, c.b, c.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }

    // Handle depth/stencil attachment
    const depthStencil = this._descriptor.depthStencilAttachment;
    if (depthStencil) {
      let clearBits = 0;

      if (depthStencil.depthLoadOp === "clear") {
        gl.clearDepth(depthStencil.depthClearValue ?? 1.0);
        clearBits |= gl.DEPTH_BUFFER_BIT;
      }

      if (depthStencil.stencilLoadOp === "clear") {
        gl.clearStencil(depthStencil.stencilClearValue ?? 0);
        clearBits |= gl.STENCIL_BUFFER_BIT;
      }

      if (clearBits) {
        gl.clear(clearBits);
      }
    }

    // Create VAO for this pass
    this._vao = gl.createVertexArray();
    gl.bindVertexArray(this._vao);
  }

  get label(): string | undefined {
    return this._label;
  }

  setPipeline(pipeline: GfxRenderPipeline): void {
    this._currentPipeline = pipeline as WebGL2RenderPipeline;
    this._currentPipeline.apply();
  }

  setVertexBuffer(slot: number, buffer: GfxBuffer, offset = 0): void {
    this._vertexBuffers.set(slot, {
      buffer: buffer as WebGL2Buffer,
      offset,
    });
  }

  setIndexBuffer(buffer: GfxBuffer, format: IndexFormat, offset = 0): void {
    this._currentIndexBuffer = buffer as WebGL2Buffer;
    this._currentIndexFormat = format;
    this._currentIndexOffset = offset;

    // Bind index buffer
    this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._currentIndexBuffer.native);
  }

  setBindGroup(index: number, bindGroup: GfxBindGroup, _dynamicOffsets?: Iterable<number>): void {
    const gl2BindGroup = bindGroup as WebGL2BindGroup;
    gl2BindGroup.apply(this._gl, index);
  }

  draw(vertexCount: number, instanceCount = 1, firstVertex = 0, firstInstance = 0): void {
    if (!this._currentPipeline) return;

    this.setupVertexAttributes();

    const mode = this._currentPipeline.getPrimitiveMode();

    if (instanceCount > 1 || firstInstance > 0) {
      // WebGL2 doesn't support firstInstance natively
      // Would need to use gl_InstanceID offset in shader
      this._gl.drawArraysInstanced(mode, firstVertex, vertexCount, instanceCount);
    } else {
      this._gl.drawArrays(mode, firstVertex, vertexCount);
    }
  }

  drawIndexed(indexCount: number, instanceCount = 1, firstIndex = 0, _baseVertex = 0, firstInstance = 0): void {
    if (!this._currentPipeline || !this._currentIndexBuffer) return;

    this.setupVertexAttributes();

    const mode = this._currentPipeline.getPrimitiveMode();
    const indexType = getGLIndexType(this._currentIndexFormat, this._gl);
    const bytesPerIndex = this._currentIndexFormat === "uint16" ? 2 : 4;
    const offset = this._currentIndexOffset + firstIndex * bytesPerIndex;

    if (instanceCount > 1 || firstInstance > 0) {
      this._gl.drawElementsInstanced(mode, indexCount, indexType, offset, instanceCount);
    } else {
      this._gl.drawElements(mode, indexCount, indexType, offset);
    }
  }

  drawIndirect(_indirectBuffer: GfxBuffer, _indirectOffset: number): void {
    // WebGL2 doesn't support indirect drawing
    console.warn("drawIndirect not supported in WebGL2");
  }

  drawIndexedIndirect(_indirectBuffer: GfxBuffer, _indirectOffset: number): void {
    // WebGL2 doesn't support indirect drawing
    console.warn("drawIndexedIndirect not supported in WebGL2");
  }

  setViewport(x: number, y: number, width: number, height: number, minDepth = 0, maxDepth = 1): void {
    this._gl.viewport(x, y, width, height);
    this._gl.depthRange(minDepth, maxDepth);
  }

  setScissorRect(x: number, y: number, width: number, height: number): void {
    this._gl.enable(this._gl.SCISSOR_TEST);
    this._gl.scissor(x, y, width, height);
  }

  setBlendConstant(color: GfxColor): void {
    this._gl.blendColor(color.r, color.g, color.b, color.a);
  }

  setStencilReference(reference: number): void {
    // Need to re-apply stencil func with new reference
    // This is a simplified version
    this._gl.stencilFunc(this._gl.ALWAYS, reference, 0xff);
  }

  /**
   * Set up vertex attributes based on current pipeline and buffers.
   */
  private setupVertexAttributes(): void {
    if (!this._currentPipeline) return;

    const gl = this._gl;
    const layouts = this._currentPipeline.vertexLayouts;

    for (let slot = 0; slot < layouts.length; slot++) {
      const layout = layouts[slot];
      const bufferBinding = this._vertexBuffers.get(slot);

      if (!layout || !bufferBinding) continue;

      gl.bindBuffer(gl.ARRAY_BUFFER, bufferBinding.buffer.native);

      for (const attr of layout.attributes) {
        const glFormat = getGLVertexFormat(attr.format, gl);

        gl.enableVertexAttribArray(attr.shaderLocation);

        if (glFormat.type === gl.INT || glFormat.type === gl.UNSIGNED_INT) {
          gl.vertexAttribIPointer(attr.shaderLocation, glFormat.size, glFormat.type, layout.arrayStride, attr.offset + bufferBinding.offset);
        } else {
          gl.vertexAttribPointer(attr.shaderLocation, glFormat.size, glFormat.type, glFormat.normalized, layout.arrayStride, attr.offset + bufferBinding.offset);
        }

        // Instance divisor
        if (layout.stepMode === "instance") {
          gl.vertexAttribDivisor(attr.shaderLocation, 1);
        } else {
          gl.vertexAttribDivisor(attr.shaderLocation, 0);
        }
      }
    }
  }

  // Debug markers (no-op in WebGL2)
  pushDebugGroup(_groupLabel: string): void {
    // No-op
  }

  popDebugGroup(): void {
    // No-op
  }

  insertDebugMarker(_markerLabel: string): void {
    // No-op
  }

  end(): void {
    if (this._ended) return;
    this._ended = true;

    const gl = this._gl;

    // Clean up VAO
    gl.bindVertexArray(null);
    if (this._vao) {
      gl.deleteVertexArray(this._vao);
      this._vao = null;
    }

    // Reset scissor
    gl.disable(gl.SCISSOR_TEST);
  }
}
