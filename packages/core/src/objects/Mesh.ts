import { Node } from "./Node";
/**
 *
 */
export abstract class Mesh extends Node {
  protected _vertexBuffer: WebGLBuffer | null = null;
  protected _indexBuffer: WebGLBuffer | null = null;

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
  }

  set indices(indices: Uint16Array) {
    this._indices = indices;
  }

  render(gl: WebGLRenderingContext): void {
    if (!this._vertexBuffer) {
      this._vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.STATIC_DRAW);
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    }
    if (!this._indexBuffer) {
      this._indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._indices, gl.STATIC_DRAW);
    } else {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);
    }
  }
}
