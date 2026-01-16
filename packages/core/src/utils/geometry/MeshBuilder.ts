import type { Shape } from "./Shape";
import type { MeshBuildResult } from "../../MeshUtils";

/**
 * Interface for mesh builders that convert shapes into renderable geometry.
 */
export interface MeshBuilder<S extends Shape> {
  build(shape: S): MeshBuildResult;
}
