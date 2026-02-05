/**
 * @arcanvas/webgl2 - WebGL2 Queue Implementation
 */

import type { GfxQueue, GfxCommandBuffer, GfxBuffer, GfxExtent3D, GfxImageCopyTexture, GfxImageDataLayout } from "@arcanvas/gfx";
import type { WebGL2Buffer } from "./resources/buffer.js";
import type { WebGL2Texture } from "./resources/texture.js";
import { getGLTextureFormat } from "./constants.js";

/**
 * WebGL2 queue.
 *
 * WebGL2 is immediate-mode, so submit() is mostly a no-op.
 */
export class WebGL2Queue implements GfxQueue {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _label: string | undefined;

  constructor(gl: WebGL2RenderingContext, label?: string) {
    this._gl = gl;
    this._label = label;
  }

  get label(): string | undefined {
    return this._label;
  }

  /**
   * Submit command buffers.
   * In WebGL2, commands execute immediately, so this is a no-op.
   */
  submit(_commandBuffers: Iterable<GfxCommandBuffer>): void {
    // Commands already executed during encoding in WebGL2
    // Flush to ensure all commands are sent to GPU
    this._gl.flush();
  }

  /**
   * Write data to a buffer.
   */
  writeBuffer(buffer: GfxBuffer, bufferOffset: number, data: BufferSource, dataOffset = 0, size?: number): void {
    const gl = this._gl;
    const glBuffer = buffer as WebGL2Buffer;

    // Get typed array view
    let srcData: ArrayBufferView;
    if (data instanceof ArrayBuffer) {
      srcData = new Uint8Array(data, dataOffset, size);
    } else {
      srcData = new Uint8Array(data.buffer, data.byteOffset + dataOffset, size ?? data.byteLength - dataOffset);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer.native);
    gl.bufferSubData(gl.ARRAY_BUFFER, bufferOffset, srcData);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  /**
   * Write data to a texture.
   */
  writeTexture(destination: GfxImageCopyTexture, data: BufferSource, dataLayout: GfxImageDataLayout, size: GfxExtent3D): void {
    const gl = this._gl;
    const texture = destination.texture as WebGL2Texture;
    const glFormat = getGLTextureFormat(texture.format, gl);

    if (!glFormat) {
      throw new Error(`Unsupported texture format: ${texture.format}`);
    }

    // Convert data to Uint8Array
    let srcData: ArrayBufferView;
    if (data instanceof ArrayBuffer) {
      srcData = new Uint8Array(data);
    } else {
      srcData = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }

    gl.bindTexture(texture.target, texture.native);

    // Set unpack parameters
    if (dataLayout.bytesPerRow !== undefined) {
      gl.pixelStorei(gl.UNPACK_ROW_LENGTH, Math.floor(dataLayout.bytesPerRow / getBytesPerPixel(texture.format)));
    }

    const x = destination.origin?.x ?? 0;
    const y = destination.origin?.y ?? 0;
    const z = destination.origin?.z ?? 0;
    const width = size.width;
    const height = size.height ?? 1;
    const depth = size.depthOrArrayLayers ?? 1;

    if (texture.target === gl.TEXTURE_3D || texture.target === gl.TEXTURE_2D_ARRAY) {
      gl.texSubImage3D(texture.target, destination.mipLevel ?? 0, x, y, z, width, height, depth, glFormat.format, glFormat.type, srcData);
    } else {
      gl.texSubImage2D(texture.target, destination.mipLevel ?? 0, x, y, width, height, glFormat.format, glFormat.type, srcData);
    }

    // Reset unpack parameters
    gl.pixelStorei(gl.UNPACK_ROW_LENGTH, 0);
    gl.bindTexture(texture.target, null);
  }

  /**
   * Signal that work is done and wait for completion.
   * WebGL2 doesn't have explicit signaling, use sync objects.
   */
  onSubmittedWorkDone(): Promise<void> {
    const gl = this._gl;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);

    if (!sync) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const checkSync = () => {
        const status = gl.clientWaitSync(sync, 0, 0);
        if (status === gl.ALREADY_SIGNALED || status === gl.CONDITION_SATISFIED) {
          gl.deleteSync(sync);
          resolve();
        } else if (status === gl.WAIT_FAILED) {
          gl.deleteSync(sync);
          resolve();
        } else {
          // TIMEOUT_EXPIRED - check again later
          requestAnimationFrame(checkSync);
        }
      };
      requestAnimationFrame(checkSync);
    });
  }
}

/**
 * Get bytes per pixel for a texture format.
 */
function getBytesPerPixel(format: string): number {
  // Simplified mapping
  const sizes: Record<string, number> = {
    r8unorm: 1,
    rg8unorm: 2,
    rgba8unorm: 4,
    "rgba8unorm-srgb": 4,
    r16float: 2,
    rg16float: 4,
    rgba16float: 8,
    r32float: 4,
    rg32float: 8,
    rgba32float: 16,
  };
  return sizes[format] ?? 4;
}
