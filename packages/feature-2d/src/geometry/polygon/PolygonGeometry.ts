import type { MeshBuildResult } from "../../utils/MeshUtils";
import { type PointsArray } from "../../utils/PointUtils";
import type { MeshBuilder } from "../MeshBuilder";
import { PolygonShape2D, PolygonShape3D, type Shape2D, type Shape3D } from "../Shape";
import { Polygon2DFanBuilder } from "./Polygon2DFanBuilder";
import { Polygon2DOutlineBuilder } from "./Polygon2DOutlineBuilder";
import { Polygon3DOutlineBuilder } from "./Polygon3DOutlineBuilder";

/**
 * Space/dimension mode for polygon geometry.
 */
export enum PolygonSpace {
  /** Automatically detect 2D vs 3D based on input format */
  Auto = "auto",
  /** Force 2D interpretation */
  Space2D = "2d",
  /** Force 3D interpretation */
  Space3D = "3d",
}

/**
 * Build mode for polygon geometry.
 */
export enum PolygonBuildMode {
  /** Outline mode - no triangulation, vertices as-is */
  Outline = "outline",
  /** Fill mode - triangle fan from centroid */
  FillFan = "fill_fan",
}

/**
 * Options for building polygon geometry.
 */
export interface PolygonGeometryOptions {
  /** Space/dimension mode (default: Auto) */
  space?: PolygonSpace;
  /** Z-index for 2D polygons (default: 0) */
  zIndex?: number;
  /** Build mode (default: Outline) */
  mode?: PolygonBuildMode;
}

/**
 * Utility class for building polygon geometry from various input formats.
 * Handles point parsing, shape creation, and mesh building.
 */
export class PolygonGeometry {
  /**
   * Build polygon geometry from points.
   * @param points - Input points in various formats
   * @param options - Build options
   * @returns Mesh build result with vertices and indices
   */
  static build(points: PointsArray | number[], options?: PolygonGeometryOptions): MeshBuildResult {
    const { space = PolygonSpace.Auto, zIndex = 0, mode = PolygonBuildMode.Outline } = options ?? {};

    const shape = PolygonGeometry.createShape(points, space, zIndex);
    const builder = PolygonGeometry.pickBuilder(shape, mode, zIndex);
    if (shape.dim === 2) {
      return (builder as MeshBuilder<Shape2D>).build(shape) as MeshBuildResult;
    } else {
      return (builder as MeshBuilder<Shape3D>).build(shape) as MeshBuildResult;
    }
  }

  /**
   * Create a shape from points based on space mode.
   */
  private static createShape(points: PointsArray | number[], space: PolygonSpace, zIndex: number): Shape2D | Shape3D {
    if (space === PolygonSpace.Space2D) {
      return new PolygonShape2D(points);
    }
    if (space === PolygonSpace.Space3D) {
      return new PolygonShape3D(points as number[], zIndex);
    }

    // Auto: detect based on input format
    if (points.length > 0) {
      const first = points[0];
      if (Array.isArray(first) && first.length === 2) {
        // Array of arrays [[x,y], ...] -> 2D
        return new PolygonShape2D(points);
      }
      if (typeof first === "number") {
        const flat = points as number[];
        if (flat.length % 3 === 0) {
          // Length divisible by 3 -> 3D
          return new PolygonShape3D(flat, zIndex);
        }
        // Otherwise -> 2D
        return new PolygonShape2D(flat);
      }
    }

    // Fallback: empty 2D shape
    return new PolygonShape2D([]);
  }

  /**
   * Pick the appropriate builder based on shape dimension and mode.
   */
  private static pickBuilder(shape: Shape2D | Shape3D, mode: PolygonBuildMode, zIndex: number): MeshBuilder<Shape2D> | MeshBuilder<Shape3D> {
    if (shape.dim === 2) {
      if (mode === PolygonBuildMode.FillFan) {
        return new Polygon2DFanBuilder(zIndex);
      }
      return new Polygon2DOutlineBuilder(zIndex);
    } else {
      // dim === 3
      // For 3D, only outline mode is currently supported
      return new Polygon3DOutlineBuilder();
    }
  }
}
