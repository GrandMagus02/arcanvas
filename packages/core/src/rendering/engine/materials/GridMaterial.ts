import type { BaseMaterial } from "../materials";

/**
 *
 */
export type GridPlane = "XY" | "XZ" | "YZ";

/**
 *
 */
export interface GridMaterialOptions {
  plane?: GridPlane;
  adaptiveSpacing?: boolean;
  cellSize?: number;
  majorDivisions?: number;
  axisLineWidth?: number;
  majorLineWidth?: number;
  minorLineWidth?: number;
  axisDashScale?: number;
  fixedPixelSize?: boolean;
  minCellPixelSize?: number;
  baseColor?: [number, number, number, number];
  minorColor?: [number, number, number, number];
  majorColor?: [number, number, number, number];
  xAxisColor?: [number, number, number, number];
  xAxisDashColor?: [number, number, number, number];
  yAxisColor?: [number, number, number, number];
  yAxisDashColor?: [number, number, number, number];
  zAxisColor?: [number, number, number, number];
  zAxisDashColor?: [number, number, number, number];
  centerColor?: [number, number, number, number];
}

/**
 * Material for the infinite grid shader.
 * Uses a special shading model "grid" that triggers custom rendering in the backend.
 */
export class GridMaterial implements BaseMaterial {
  readonly shadingModel = "grid" as const;

  // Grid plane
  plane: GridPlane = "XY";

  // Spacing
  adaptiveSpacing = true;
  cellSize = 50;
  majorDivisions = 10;
  minCellPixelSize = 0;

  // Line widths
  axisLineWidth = 2;
  majorLineWidth = 1.5;
  minorLineWidth = 1;
  axisDashScale = 1.33;
  fixedPixelSize = false;

  // Colors
  baseColor: [number, number, number, number] = [0, 0, 0, 1];
  minorColor: [number, number, number, number] = [1, 1, 1, 1];
  majorColor: [number, number, number, number] = [1, 1, 1, 1];
  xAxisColor: [number, number, number, number] = [1, 0, 0, 1];
  xAxisDashColor: [number, number, number, number] = [0.5, 0, 0, 1];
  yAxisColor: [number, number, number, number] = [0, 1, 0, 1];
  yAxisDashColor: [number, number, number, number] = [0, 0.5, 0, 1];
  zAxisColor: [number, number, number, number] = [0, 0, 1, 1];
  zAxisDashColor: [number, number, number, number] = [0, 0, 0.5, 1];
  centerColor: [number, number, number, number] = [1, 1, 1, 1];

  constructor(options: GridMaterialOptions = {}) {
    if (options.plane !== undefined) this.plane = options.plane;
    if (options.adaptiveSpacing !== undefined) this.adaptiveSpacing = options.adaptiveSpacing;
    if (options.cellSize !== undefined) this.cellSize = options.cellSize;
    if (options.majorDivisions !== undefined) this.majorDivisions = options.majorDivisions;
    if (options.axisLineWidth !== undefined) this.axisLineWidth = options.axisLineWidth;
    if (options.majorLineWidth !== undefined) this.majorLineWidth = options.majorLineWidth;
    if (options.minorLineWidth !== undefined) this.minorLineWidth = options.minorLineWidth;
    if (options.axisDashScale !== undefined) this.axisDashScale = options.axisDashScale;
    if (options.fixedPixelSize !== undefined) this.fixedPixelSize = options.fixedPixelSize;
    if (options.minCellPixelSize !== undefined) this.minCellPixelSize = options.minCellPixelSize;
    if (options.baseColor !== undefined) this.baseColor = options.baseColor;
    if (options.minorColor !== undefined) this.minorColor = options.minorColor;
    if (options.majorColor !== undefined) this.majorColor = options.majorColor;
    if (options.xAxisColor !== undefined) this.xAxisColor = options.xAxisColor;
    if (options.xAxisDashColor !== undefined) this.xAxisDashColor = options.xAxisDashColor;
    if (options.yAxisColor !== undefined) this.yAxisColor = options.yAxisColor;
    if (options.yAxisDashColor !== undefined) this.yAxisDashColor = options.yAxisDashColor;
    if (options.zAxisColor !== undefined) this.zAxisColor = options.zAxisColor;
    if (options.zAxisDashColor !== undefined) this.zAxisDashColor = options.zAxisDashColor;
    if (options.centerColor !== undefined) this.centerColor = options.centerColor;
  }
}
