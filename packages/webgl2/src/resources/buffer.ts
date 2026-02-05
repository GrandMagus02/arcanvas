/**
 * @arcanvas/webgl2 - WebGL2 Buffer Implementation
 */

import type { GfxBuffer, GfxBufferDescriptor, MapModeFlags } from "@arcanvas/gfx";
import { BufferUsage, MapMode, GfxValidationError } from "@arcanvas/gfx";

/**
 * WebGL2 buffer wrapper implementing GfxBuffer.
 */
export class WebGL2Buffer implements GfxBuffer {
  private readonly _gl: WebGL2RenderingContext;
  private readonly _buffer: WebGLBuffer;
  private readonly _size: number;
  private readonly _usage: number;
  private readonly _label: string | undefined;

  /** Staging buffer for map/unmap operations (WebGL2 doesn't support direct mapping) */
  private _mappedData: ArrayBuffer | null = null;
  private _mappedOffset = 0;
  private _mappedSize = 0;

  private constructor(gl: WebGL2RenderingContext, buffer: WebGLBuffer, size: number, usage: number, label?: string) {
    this._gl = gl;
    this._buffer = buffer;
    this._size = size;
    this._usage = usage;
    this._label = label;
  }

  static create(gl: WebGL2RenderingContext, descriptor: GfxBufferDescriptor): WebGL2Buffer {
    const buffer = gl.createBuffer();
    if (!buffer) {
      throw new GfxValidationError("Failed to create WebGL2 buffer");
    }

    // Determine WebGL usage hint based on GfxBuffer usage flags
    const glUsage = getGLBufferUsage(descriptor.usage, gl);

    // Bind and allocate
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, descriptor.size, glUsage);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return new WebGL2Buffer(gl, buffer, descriptor.size, descriptor.usage, descriptor.label);
  }

  get size(): number {
    return this._size;
  }

  get usage(): number {
    return this._usage;
  }

  get label(): string | undefined {
    return this._label;
  }

  get native(): WebGLBuffer {
    return this._buffer;
  }

  get mapState(): "unmapped" | "pending" | "mapped" {
    return this._mappedData ? "mapped" : "unmapped";
  }

  /**
   * WebGL2 doesn't support true async buffer mapping.
   * We emulate it with a staging ArrayBuffer.
   */
  mapAsync(mode: MapModeFlags, offset = 0, size?: number): Promise<void> {
    const mapSize = size ?? this._size - offset;

    if (this._mappedData) {
      throw new GfxValidationError("Buffer is already mapped");
    }

    // For read operations, we need to get data from GPU
    if (mode & MapMode.READ) {
      // WebGL2 doesn't have readback-friendly buffers
      // We'd need to use transform feedback or pixel buffer objects
      // For now, just create an empty buffer for the map
      this._mappedData = new ArrayBuffer(mapSize);

      // If the buffer has COPY_SRC usage, we could potentially read it
      // This is a limitation of WebGL2
    } else {
      // For write-only, just allocate staging buffer
      this._mappedData = new ArrayBuffer(mapSize);
    }

    this._mappedOffset = offset;
    this._mappedSize = mapSize;

    return Promise.resolve();
  }

  getMappedRange(offset = 0, size?: number): ArrayBuffer {
    if (!this._mappedData) {
      throw new GfxValidationError("Buffer is not mapped");
    }

    const rangeSize = size ?? this._mappedSize - offset;

    // Return a view into the mapped data
    return this._mappedData.slice(offset, offset + rangeSize);
  }

  unmap(): void {
    if (!this._mappedData) {
      throw new GfxValidationError("Buffer is not mapped");
    }

    // Upload the staged data to GPU
    const gl = this._gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, this._mappedOffset, this._mappedData);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this._mappedData = null;
    this._mappedOffset = 0;
    this._mappedSize = 0;
  }

  destroy(): void {
    this._gl.deleteBuffer(this._buffer);
  }
}

/**
 * Determine WebGL usage hint from GfxBuffer usage flags.
 */
function getGLBufferUsage(usage: number, gl: WebGL2RenderingContext): GLenum {
  // Map read implies we'll read from GPU (rare in WebGL)
  const hasMapRead = (usage & BufferUsage.MAP_READ) !== 0;
  // Map write implies we'll write frequently
  const hasMapWrite = (usage & BufferUsage.MAP_WRITE) !== 0;
  // Copy destination implies we'll update via bufferSubData
  const hasCopyDst = (usage & BufferUsage.COPY_DST) !== 0;

  if (hasMapRead) {
    return gl.STREAM_READ;
  } else if (hasMapWrite || hasCopyDst) {
    return gl.DYNAMIC_DRAW;
  } else {
    return gl.STATIC_DRAW;
  }
}
