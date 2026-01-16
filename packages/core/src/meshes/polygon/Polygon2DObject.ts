import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../utils/geometry/polygon/PolygonGeometry";
import type { PointsArray } from "../../utils/PointUtils";
import { Mesh } from "../../rendering/engine/Mesh";
import { createPositionLayout } from "../../rendering/engine/vertexLayout";
import type { BaseMaterial } from "../../rendering/engine/materials";
import { UnlitColorMaterial } from "../../rendering/engine/materials";
import { RenderObject } from "../../scene/RenderObject";

/**
 *
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
