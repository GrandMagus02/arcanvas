/**
 * @arcanvas/webgl2 - WebGL2 Command Encoder Implementation
 *
 * WebGL2 is immediate-mode, so commands execute immediately.
 * The command encoder is mainly for API compatibility.
 */

import type {
  GfxBuffer,
  GfxCommandBuffer,
  GfxCommandEncoder,
  GfxComputePassDescriptor,
  GfxComputePassEncoder,
  GfxExtent3D,
  GfxImageCopyBuffer,
  GfxImageCopyTexture,
  GfxRenderPassDescriptor,
  GfxRenderPassEncoder,
} from "@arcanvas/gfx";
import { GfxValidationError } from "@arcanvas/gfx";
import { getGLTextureFormat } from "../constants.js";
import type { WebGL2Buffer } from "../resources/buffer.js";
import type { WebGL2Texture } from "../resources/texture.js";
import { WebGL2RenderPassEncoder } from "./renderPass.js";

/**
 * WebGL2 command buffer (no-op for WebGL2 since commands execute immediately).
 */
export class WebGL2CommandBuffer implements GfxCommandBuffer {
  private readonly _label: string | undefined;

  constructor(label?: string) {
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }
}

/**
 * WebGL2 command encoder.
 */
export class WebGL2CommandEncoder implements GfxCommandEncoder {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _label: string | undefined;
  private _finished = false;

  constructor(gl: WebGL2RenderingContext, label?: string) {
    this._gl = gl;
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  beginRenderPass(descriptor: GfxRenderPassDescriptor): GfxRenderPassEncoder {
    if (this._finished) {
      throw new GfxValidationError("Command encoder already finished");
    }
    return new WebGL2RenderPassEncoder(this._gl, descriptor);
  }

  beginComputePass(_descriptor?: GfxComputePassDescriptor): GfxComputePassEncoder {
    throw new GfxValidationError("Compute passes not supported in WebGL2");
  }

  copyBufferToBuffer(source: GfxBuffer, sourceOffset: number, destination: GfxBuffer, destinationOffset: number, size: number): void {
    const gl = this._gl;
    const srcBuffer = source as WebGL2Buffer;
    const dstBuffer = destination as WebGL2Buffer;

    gl.bindBuffer(gl.COPY_READ_BUFFER, srcBuffer.native);
    gl.bindBuffer(gl.COPY_WRITE_BUFFER, dstBuffer.native);
    gl.copyBufferSubData(gl.COPY_READ_BUFFER, gl.COPY_WRITE_BUFFER, sourceOffset, destinationOffset, size);
    gl.bindBuffer(gl.COPY_READ_BUFFER, null);
    gl.bindBuffer(gl.COPY_WRITE_BUFFER, null);
  }

  copyBufferToTexture(source: GfxImageCopyBuffer, destination: GfxImageCopyTexture, copySize: GfxExtent3D): void {
    const gl = this._gl;
    const srcBuffer = source.buffer as WebGL2Buffer;
    const dstTexture = destination.texture as WebGL2Texture;

    const glFormat = getGLTextureFormat(dstTexture.format, gl);
    if (!glFormat) {
      throw new GfxValidationError(`Unsupported texture format: ${dstTexture.format}`);
    }

    // Bind PBO
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, srcBuffer.native);

    // Bind texture
    gl.bindTexture(dstTexture.target, dstTexture.native);

    const x = destination.origin?.x ?? 0;
    const y = destination.origin?.y ?? 0;
    const z = destination.origin?.z ?? 0;
    const width = copySize.width;
    const height = copySize.height ?? 1;
    const depth = copySize.depthOrArrayLayers ?? 1;

    if (dstTexture.target === gl.TEXTURE_3D || dstTexture.target === gl.TEXTURE_2D_ARRAY) {
      gl.texSubImage3D(dstTexture.target, destination.mipLevel ?? 0, x, y, z, width, height, depth, glFormat.format, glFormat.type, source.offset ?? 0);
    } else {
      gl.texSubImage2D(dstTexture.target, destination.mipLevel ?? 0, x, y, width, height, glFormat.format, glFormat.type, source.offset ?? 0);
    }

    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    gl.bindTexture(dstTexture.target, null);
  }

  copyTextureToBuffer(_source: GfxImageCopyTexture, _destination: GfxImageCopyBuffer, _copySize: GfxExtent3D): void {
    // WebGL2 texture readback is complex (requires FBO + readPixels)
    // This is a simplified implementation
    throw new GfxValidationError("copyTextureToBuffer requires FBO setup - not yet implemented");
  }

  copyTextureToTexture(source: GfxImageCopyTexture, destination: GfxImageCopyTexture, copySize: GfxExtent3D): void {
    const gl = this._gl;
    const srcTexture = source.texture as WebGL2Texture;
    const dstTexture = destination.texture as WebGL2Texture;

    // Use copyTexSubImage or FBO blit
    // This is a simplified version using FBO
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, srcTexture.target, srcTexture.native, source.mipLevel ?? 0);

    gl.bindTexture(dstTexture.target, dstTexture.native);
    gl.copyTexSubImage2D(
      dstTexture.target,
      destination.mipLevel ?? 0,
      destination.origin?.x ?? 0,
      destination.origin?.y ?? 0,
      source.origin?.x ?? 0,
      source.origin?.y ?? 0,
      copySize.width,
      copySize.height ?? 1
    );

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.deleteFramebuffer(fbo);
    gl.bindTexture(dstTexture.target, null);
  }

  clearBuffer(buffer: GfxBuffer, offset = 0, size?: number): void {
    const gl = this._gl;
    const glBuffer = buffer as WebGL2Buffer;
    const clearSize = size ?? glBuffer.size - offset;

    // WebGL2 doesn't have clearBuffer, use bufferSubData with zeros
    const zeros = new Uint8Array(clearSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.native);
    gl.bufferSubData(gl.ARRAY_BUFFER, offset, zeros);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  // Debug markers (no-op in WebGL2, but could use debug extension)
  pushDebugGroup(_groupLabel: string): void {
    // WebGL2 doesn't have native debug groups
    // Could use WEBGL_debug_marker extension if available
  }

  popDebugGroup(): void {
    // No-op
  }

  insertDebugMarker(_markerLabel: string): void {
    // No-op
  }

  finish(): GfxCommandBuffer {
    this._finished = true;
    return new WebGL2CommandBuffer(this._label);
  }
}
