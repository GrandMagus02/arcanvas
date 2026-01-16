import { Mesh, createPositionLayout, RenderObject, UnlitColorMaterial, type BaseMaterial } from "@arcanvas/graphics";
import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../geometry/polygon/PolygonGeometry";
import type { PointsArray } from "../../utils/PointUtils";

/**
 * Options for creating a Polygon2DObject.
 */
export interface Polygon2DObjectOptions {
  zIndex?: number;
}

/**
 * Engine-level 2D polygon render object using the new mesh/material pipeline.
 */
export class Polygon2DObject extends RenderObject {
  constructor(points: PointsArray, options: Polygon2DObjectOptions = {}, material: BaseMaterial = new UnlitColorMaterial()) {
    const geom = PolygonGeometry.build(points, {
      space: PolygonSpace.Space2D,
      mode: PolygonBuildMode.FillFan,
      zIndex: options.zIndex ?? 0,
    });
    const mesh = new Mesh(geom.vertices, geom.indices, createPositionLayout(3), "triangles");
    super(mesh, material);
  }
}
