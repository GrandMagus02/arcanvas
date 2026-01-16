import type { BufferHandle, IRenderContext, Renderable } from "../rendering/context";
import { Entity } from "./Entity";

/**
 * Base class for all mesh objects that can be rendered.
 */
export abstract class Mesh extends Entity implements Renderable {
  protected _vertexBuffer: BufferHandle = null;
  protected _indexBuffer: BufferHandle = null;

  private _vertices: Float32Array;
  private _indices: Uint16Array;

  protected _fragmentShader: WebGLShader | null = null;
  protected _vertexShader: WebGLShader | null = null;

  protected _program: WebGLProgram | null = null;

  constructor(vertices: Float32Array, indices: Uint16Array) {
    super();
    this._vertices = vertices;
    this._indices = indices;
  }

  get vertices(): Float32Array {
    return this._vertices;
  }

  get indices(): Uint16Array {
    return this._indices;
  }

  set vertices(vertices: Float32Array) {
    this._vertices = vertices;
    // Mark buffer as dirty so it will be recreated on next render
    this._vertexBuffer = null;
  }

  set indices(indices: Uint16Array) {
    this._indices = indices;
    // Mark buffer as dirty so it will be recreated on next render
    this._indexBuffer = null;
  }

  /**
   * Renders this mesh using the provided render context.
   * Sets up vertex and index buffers. Subclasses should call this first,
   * then set up attributes/uniforms and call draw commands.
   *
   * @param ctx The render context to use for rendering.
   */
  render(ctx: IRenderContext): void {
    if (!this._vertexBuffer) {
      this._vertexBuffer = ctx.createVertexBuffer(this._vertices);
    } else {
      ctx.bindVertexBuffer(this._vertexBuffer);
    }

    // Only create/bind index buffer if indices exist
    if (this._indices.length > 0) {
      if (!this._indexBuffer) {
        this._indexBuffer = ctx.createIndexBuffer(this._indices);
      } else {
        ctx.bindIndexBuffer(this._indexBuffer);
      }
    }
  }
}
