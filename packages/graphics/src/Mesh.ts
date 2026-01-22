import type { Cloneable } from "@arcanvas/core";
import type { VertexLayout } from "./vertexLayout";

/**
 * Draw mode for mesh rendering.
 */
export type DrawMode = "triangles" | "lines" | "points";

/**
 * API-agnostic mesh container.
 * Holds geometry data and layout information only - no GPU resources.
 */
export class Mesh implements Cloneable<Mesh> {
  private _vertices: Float32Array;
  private _indices: Uint16Array | Uint32Array;
  private _layout: VertexLayout;
  private _drawMode: DrawMode;
  private _version = 0;

  constructor(vertices: Float32Array, indices: Uint16Array | Uint32Array, layout: VertexLayout, drawMode: DrawMode = "triangles") {
    this._vertices = vertices;
    this._indices = indices;
    this._layout = layout;
    this._drawMode = drawMode;
  }

  get vertices(): Float32Array {
    return this._vertices;
  }

  set vertices(value: Float32Array) {
    this._vertices = value;
    this._version++;
  }

  get indices(): Uint16Array | Uint32Array {
    return this._indices;
  }

  set indices(value: Uint16Array | Uint32Array) {
    this._indices = value;
    this._version++;
  }

  get layout(): VertexLayout {
    return this._layout;
  }

  set layout(value: VertexLayout) {
    this._layout = value;
    this._version++;
  }

  get drawMode(): DrawMode {
    return this._drawMode;
  }

  set drawMode(value: DrawMode) {
    this._drawMode = value;
    this._version++;
  }

  /**
   * Version number that increments on any data change.
   * Used by backends to detect when buffers need updating.
   */
  get version(): number {
    return this._version;
  }

  get hasIndices(): boolean {
    return this._indices.length > 0;
  }

  get vertexCount(): number {
    return this._vertices.byteLength / this._layout.stride;
  }

  /**
   * Creates a copy of this mesh.
   */
  clone(): Mesh {
    // Deep copy the layout to avoid sharing the attributes array
    const clonedLayout: VertexLayout = {
      stride: this._layout.stride,
      attributes: this._layout.attributes.map((attr) => ({ ...attr })),
    };
    return new Mesh(new Float32Array(this._vertices), this._indices instanceof Uint32Array ? new Uint32Array(this._indices) : new Uint16Array(this._indices), clonedLayout, this._drawMode);
  }
}
