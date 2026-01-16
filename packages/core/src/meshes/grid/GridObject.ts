import { RenderObject } from "../../scene/RenderObject";
import { Mesh } from "../../rendering/engine/Mesh";
import { GridMaterial, type GridMaterialOptions } from "../../rendering/engine/materials/GridMaterial";
import type { VertexLayout } from "../../rendering/engine/vertexLayout";

/**
 * Vertex layout for grid (2D clip-space positions).
 */
const GRID_VERTEX_LAYOUT: VertexLayout = {
  stride: 2 * Float32Array.BYTES_PER_ELEMENT,
  attributes: [
    {
      semantic: "position",
      components: 2,
      type: "float",
      normalized: false,
      offset: 0,
    },
  ],
};

/**
 * Fullscreen triangle for grid rendering.
 * Covers clip space: (-1,-1), (3,-1), (-1,3)
 */
const FULLSCREEN_VERTICES = new Float32Array([-1, -1, 3, -1, -1, 3]);
const FULLSCREEN_INDICES = new Uint16Array([0, 1, 2]);

/**
 * Engine-level grid object for the new rendering pipeline.
 * Uses a procedural shader to render an infinite grid.
 */
export class GridObject extends RenderObject {
  private _gridMaterial: GridMaterial;

  constructor(options: GridMaterialOptions = {}) {
    const mesh = new Mesh(FULLSCREEN_VERTICES, FULLSCREEN_INDICES, GRID_VERTEX_LAYOUT, "triangles");
    const material = new GridMaterial(options);
    super(mesh, material);
    this._gridMaterial = material;
    this.name = "Grid";
  }

  get gridMaterial(): GridMaterial {
    return this._gridMaterial;
  }

  // Convenience setters that delegate to the material

  setPlane(plane: GridMaterialOptions["plane"]): this {
    if (plane !== undefined) this._gridMaterial.plane = plane;
    return this;
  }

  setAdaptiveSpacing(enabled: boolean): this {
    this._gridMaterial.adaptiveSpacing = enabled;
    return this;
  }

  setCellSize(size: number): this {
    if (Number.isFinite(size) && size > 0) this._gridMaterial.cellSize = size;
    return this;
  }

  setMajorDivisions(div: number): this {
    if (Number.isFinite(div) && div >= 2) this._gridMaterial.majorDivisions = Math.round(div);
    return this;
  }

  setAxisLineWidth(width: number): this {
    if (Number.isFinite(width) && width >= 0) this._gridMaterial.axisLineWidth = width;
    return this;
  }

  setMajorLineWidth(width: number): this {
    if (Number.isFinite(width) && width >= 0) this._gridMaterial.majorLineWidth = width;
    return this;
  }

  setMinorLineWidth(width: number): this {
    if (Number.isFinite(width) && width >= 0) this._gridMaterial.minorLineWidth = width;
    return this;
  }

  setAxisDashScale(scale: number): this {
    if (Number.isFinite(scale) && scale > 0) this._gridMaterial.axisDashScale = scale;
    return this;
  }

  setMinCellPixelSize(pixels: number): this {
    if (Number.isFinite(pixels) && pixels >= 0) this._gridMaterial.minCellPixelSize = pixels;
    return this;
  }

  setFixedPixelSize(enabled: boolean): this {
    this._gridMaterial.fixedPixelSize = enabled;
    return this;
  }

  setBaseColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.baseColor = [r, g, b, a];
    return this;
  }

  setMinorColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.minorColor = [r, g, b, a];
    return this;
  }

  setMajorColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.majorColor = [r, g, b, a];
    return this;
  }

  setXAxisColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.xAxisColor = [r, g, b, a];
    return this;
  }

  setXAxisDashColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.xAxisDashColor = [r, g, b, a];
    return this;
  }

  setYAxisColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.yAxisColor = [r, g, b, a];
    return this;
  }

  setYAxisDashColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.yAxisDashColor = [r, g, b, a];
    return this;
  }

  setZAxisColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.zAxisColor = [r, g, b, a];
    return this;
  }

  setZAxisDashColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.zAxisDashColor = [r, g, b, a];
    return this;
  }

  setCenterColor(r: number, g: number, b: number, a: number): this {
    this._gridMaterial.centerColor = [r, g, b, a];
    return this;
  }
}
