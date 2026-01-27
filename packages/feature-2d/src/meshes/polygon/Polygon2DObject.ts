import { createPositionLayout, Mesh, RenderObject, UnlitColorMaterial, type BaseMaterial } from "@arcanvas/graphics";
import { uuid } from "@arcanvas/scene";
import type { ISelectable } from "@arcanvas/selection";
import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../geometry/polygon/PolygonGeometry";
import { BoundingBox2D } from "../../utils/BoundingBox2D";
import type { PointsArray } from "../../utils/PointUtils";

/**
 * Options for creating a Polygon2DObject.
 */
export interface Polygon2DObjectOptions {
  zIndex?: number;
  id?: string;
  visible?: boolean;
}

/**
 * Engine-level 2D polygon render object using the new mesh/material pipeline.
 * Implements ISelectable for selection support.
 */
export class Polygon2DObject extends RenderObject implements ISelectable {
  readonly id: string;
  private _visible: boolean = true;
  private _originalPoints: { x: number; y: number }[];

  constructor(points: PointsArray, options: Polygon2DObjectOptions = {}, material: BaseMaterial = new UnlitColorMaterial()) {
    const geom = PolygonGeometry.build(points, {
      space: PolygonSpace.Space2D,
      mode: PolygonBuildMode.FillFan,
      zIndex: options.zIndex ?? 0,
    });
    const mesh = new Mesh(geom.vertices, geom.indices, createPositionLayout(3), "triangles");
    super(mesh, material);
    this.id = options.id ?? uuid();
    this._visible = options.visible ?? true;
    
    // Store original points for bounding box calculation
    // Convert PointsArray to {x,y}[] format
    this._originalPoints = [];
    if (points.length > 0) {
      if (Array.isArray(points[0])) {
        // Array of arrays [[x,y], ...]
        for (const p of points as number[][]) {
          if (p.length >= 2) {
            this._originalPoints.push({ x: p[0]!, y: p[1]! });
          }
        }
      } else {
        // Flat array [x0, y0, x1, y1, ...]
        const flat = points as number[];
        for (let i = 0; i < flat.length; i += 2) {
          if (i + 1 < flat.length) {
            this._originalPoints.push({ x: flat[i]!, y: flat[i + 1]! });
          }
        }
      }
    }
  }

  /**
   * Gets the original polygon points in local space.
   */
  getOriginalPoints(): { x: number; y: number }[] {
    return this._originalPoints;
  }

  /**
   * Gets the bounding box of this polygon in world space.
   */
  getBounds(): BoundingBox2D | null {
    if (this._originalPoints.length === 0) {
      return null;
    }
    // Use original points and apply transform
    return BoundingBox2D.fromTransformedPoints(this._originalPoints, this.transform.matrix);
  }

  /**
   * Checks if this object is visible.
   */
  isVisible(): boolean {
    return this._visible;
  }

  /**
   * Sets the visibility of this object.
   */
  setVisible(visible: boolean): void {
    this._visible = visible;
  }
}
