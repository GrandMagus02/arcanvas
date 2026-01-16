import { Mesh, createPositionLayout, RenderObject, UnlitColorMaterial, type BaseMaterial } from "@arcanvas/graphics";
import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../geometry/polygon/PolygonGeometry";
import type { PointsArray } from "../../utils/PointUtils";

/**
 * Engine-level polygon render object using the new mesh/material pipeline.
 */
export class PolygonObject extends RenderObject {
  constructor(points: PointsArray | number[], material: BaseMaterial = new UnlitColorMaterial()) {
    const geom = PolygonGeometry.build(points, {
      space: PolygonSpace.Auto,
      mode: PolygonBuildMode.Outline,
    });
    const mesh = new Mesh(geom.vertices, geom.indices, createPositionLayout(3), "lines");
    super(mesh, material);
  }
}
