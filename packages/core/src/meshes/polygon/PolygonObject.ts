import { PolygonBuildMode, PolygonGeometry, PolygonSpace } from "../../utils/geometry/polygon/PolygonGeometry";
import type { PointsArray } from "../../utils/PointUtils";
import { Mesh } from "../../rendering/engine/Mesh";
import { createPositionLayout } from "../../rendering/engine/vertexLayout";
import type { BaseMaterial } from "../../rendering/engine/materials";
import { UnlitColorMaterial } from "../../rendering/engine/materials";
import { RenderObject } from "../../scene/RenderObject";

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
