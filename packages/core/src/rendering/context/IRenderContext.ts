/**
 * Handle for a buffer resource managed by the render context.
 * The actual type depends on the implementation (WebGLBuffer, GPUBuffer, etc.).
 */
export type BufferHandle = object | null;

/**
 * Handle for a shader program managed by the render context.
 * The actual type depends on the implementation (WebGLProgram, GPUShaderModule, etc.).
 */
export type ProgramHandle = unknown;

/**
 * Abstraction over rendering API (WebGL, WebGPU, Canvas2D, etc.).
 *
 * This interface provides a unified API for mesh rendering operations,
 * allowing the same mesh code to work with different rendering backends.
 */
export interface IRenderContext {
  /**
   * Creates a vertex buffer from the given data.
   *
   * @param data Vertex data to upload.
   * @returns A handle to the created buffer.
   */
  createVertexBuffer(data: Float32Array): BufferHandle;

  /**
   * Creates an index buffer from the given data.
   *
   * @param data Index data to upload.
   * @returns A handle to the created buffer.
   */
  createIndexBuffer(data: Uint16Array): BufferHandle;

  /**
   * Binds a vertex buffer for rendering.
   *
   * @param buffer Handle to the vertex buffer to bind.
   */
  bindVertexBuffer(buffer: BufferHandle): void;

  /**
   * Binds an index buffer for rendering.
   *
   * @param buffer Handle to the index buffer to bind.
   */
  bindIndexBuffer(buffer: BufferHandle): void;

  /**
   * Sets up vertex attribute pointer for the given attribute location.
   *
   * @param location Attribute location/index.
   * @param size Number of components per attribute (1-4).
   * @param type Data type (typically FLOAT).
   * @param normalized Whether to normalize integer values.
   * @param stride Byte offset between consecutive attributes.
   * @param offset Byte offset of the first attribute.
   */
  vertexAttribPointer(location: number, size: number, type: number, normalized: boolean, stride: number, offset: number): void;

  /**
   * Enables a vertex attribute array.
   *
   * @param location Attribute location/index to enable.
   */
  enableVertexAttribArray(location: number): void;

  /**
   * Disables a vertex attribute array.
   *
   * @param location Attribute location/index to disable.
   */
  disableVertexAttribArray(location: number): void;

  /**
   * Uses a shader program for subsequent draw calls.
   *
   * @param program Handle to the program to use.
   */
  useProgram(program: ProgramHandle): void;

  /**
   * Draws indexed primitives.
   *
   * @param mode Primitive type (e.g., TRIANGLES).
   * @param count Number of indices to draw.
   * @param type Type of index data (e.g., UNSIGNED_SHORT).
   * @param offset Byte offset into the index buffer.
   */
  drawIndexed(mode: number, count: number, type: number, offset: number): void;

  /**
   * Draws non-indexed primitives (arrays).
   *
   * @param mode Primitive type (e.g., TRIANGLES).
   * @param first Starting index in the vertex array.
   * @param count Number of vertices to draw.
   */
  drawArrays(mode: number, first: number, count: number): void;

  /**
   * Sets a uniform value (1 float).
   *
   * @param location Uniform location.
   * @param value Float value.
   */
  uniform1f(location: number | null, value: number): void;

  /**
   * Sets a uniform value (2 floats).
   *
   * @param location Uniform location.
   * @param x First float value.
   * @param y Second float value.
   */
  uniform2f(location: number | null, x: number, y: number): void;

  /**
   * Sets a uniform value (3 floats).
   *
   * @param location Uniform location.
   * @param x First float value.
   * @param y Second float value.
   * @param z Third float value.
   */
  uniform3f(location: number | null, x: number, y: number, z: number): void;

  /**
   * Sets a uniform value (4 floats).
   *
   * @param location Uniform location.
   * @param x First float value.
   * @param y Second float value.
   * @param z Third float value.
   * @param w Fourth float value.
   */
  uniform4f(location: number | null, x: number, y: number, z: number, w: number): void;

  /**
   * Sets a uniform value (1 integer).
   *
   * @param location Uniform location.
   * @param value Integer value.
   */
  uniform1i(location: number | null, value: number): void;

  /**
   * Sets a uniform matrix value (4x4 matrix).
   *
   * @param location Uniform location.
   * @param transpose Whether to transpose the matrix (typically false for WebGL).
   * @param value Matrix data in column-major order.
   */
  uniformMatrix4fv(location: number | null, transpose: boolean, value: Float32Array): void;

  /**
   * Sets the clear color for the color buffer.
   *
   * @param r Red component (0-1).
   * @param g Green component (0-1).
   * @param b Blue component (0-1).
   * @param a Alpha component (0-1).
   */
  clearColor(r: number, g: number, b: number, a: number): void;

  /**
   * Enables or disables writing to color channels.
   *
   * @param r Red channel write enabled.
   * @param g Green channel write enabled.
   * @param b Blue channel write enabled.
   * @param a Alpha channel write enabled.
   */
  colorMask(r: boolean, g: boolean, b: boolean, a: boolean): void;

  /**
   * Clears the specified buffers.
   *
   * @param mask Bitwise OR of buffer bits to clear (e.g., COLOR_BUFFER_BIT | DEPTH_BUFFER_BIT).
   */
  clear(mask: number): void;

  /**
   * Gets the underlying WebGL context (for advanced operations).
   * This method is WebGL-specific and may return null for other backends.
   *
   * @returns The WebGL rendering context, or null if not available.
   */
  getWebGLContext(): WebGLRenderingContext | null;
}

