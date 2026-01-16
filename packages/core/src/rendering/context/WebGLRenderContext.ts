import type { BufferHandle, IRenderContext, ProgramHandle } from "./IRenderContext";
import type { ProgramCache } from "../gpu/ProgramCache";
import type { ShaderLibrary } from "../gpu/ShaderLibrary";

/**
 * WebGL implementation of {@link IRenderContext}.
 */
export class WebGLRenderContext implements IRenderContext {
  constructor(
    private gl: WebGLRenderingContext,
    private program: WebGLProgram | null = null,
    private programCache?: ProgramCache,
    private shaderLibrary?: ShaderLibrary
  ) {
    // Don't automatically activate program - let meshes manage their own programs
    // This avoids errors when no program is set or when the program isn't properly linked
  }

  createVertexBuffer(data: Float32Array): BufferHandle {
    const buf = this.gl.createBuffer();
    if (!buf) {
      throw new Error("Failed to create vertex buffer");
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buf as BufferHandle;
  }

  createIndexBuffer(data: Uint16Array): BufferHandle {
    const buf = this.gl.createBuffer();
    if (!buf) {
      throw new Error("Failed to create index buffer");
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buf);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buf as BufferHandle;
  }

  bindVertexBuffer(buffer: BufferHandle): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer as WebGLBuffer);
  }

  bindIndexBuffer(buffer: BufferHandle): void {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer as WebGLBuffer);
  }

  vertexAttribPointer(location: number, size: number, type: number, normalized: boolean, stride: number, offset: number): void {
    this.gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
  }

  enableVertexAttribArray(location: number): void {
    this.gl.enableVertexAttribArray(location);
  }

  disableVertexAttribArray(location: number): void {
    this.gl.disableVertexAttribArray(location);
  }

  useProgram(program: ProgramHandle): void {
    this.gl.useProgram(program as WebGLProgram);
  }

  drawIndexed(mode: number, count: number, type: number, offset: number): void {
    this.gl.drawElements(mode, count, type, offset);
  }

  drawArrays(mode: number, first: number, count: number): void {
    this.gl.drawArrays(mode, first, count);
  }

  uniform1f(location: number | null, value: number): void {
    if (location !== null) {
      this.gl.uniform1f(location, value);
    }
  }

  uniform2f(location: number | null, x: number, y: number): void {
    if (location !== null) {
      this.gl.uniform2f(location, x, y);
    }
  }

  uniform3f(location: number | null, x: number, y: number, z: number): void {
    if (location !== null) {
      this.gl.uniform3f(location, x, y, z);
    }
  }

  uniform4f(location: number | null, x: number, y: number, z: number, w: number): void {
    if (location !== null) {
      this.gl.uniform4f(location, x, y, z, w);
    }
  }

  uniform1i(location: number | null, value: number): void {
    if (location !== null) {
      this.gl.uniform1i(location, value);
    }
  }

  uniformMatrix4fv(location: number | null, transpose: boolean, value: Float32Array): void {
    if (location !== null) {
      this.gl.uniformMatrix4fv(location, transpose, value);
    }
  }

  clearColor(r: number, g: number, b: number, a: number): void {
    this.gl.clearColor(r, g, b, a);
  }

  colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void {
    this.gl.colorMask(r, g, b, a);
  }

  clear(mask: number): void {
    this.gl.clear(mask);
  }

  getWebGLContext(): WebGLRenderingContext | null {
    return this.gl;
  }

  /**
   * Gets the WebGL program associated with this context.
   *
   * @returns The WebGL program, or null if none is set.
   */
  getProgram(): WebGLProgram | null {
    return this.program;
  }

  getProgramCache(): ProgramCache {
    if (!this.programCache) {
      throw new Error("ProgramCache not provided to WebGLRenderContext");
    }
    return this.programCache;
  }

  getShaderLibrary(): ShaderLibrary {
    if (!this.shaderLibrary) {
      throw new Error("ShaderLibrary not provided to WebGLRenderContext");
    }
    return this.shaderLibrary;
  }
}
