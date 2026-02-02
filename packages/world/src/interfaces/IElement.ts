import type { Identifiable, IMatrix, Named } from "@arcanvas/core";

/**
 * Minimal element interface for selection adorners.
 * World Element and existing render objects (e.g. Polygon2DObject) can implement or adapt to this
 * so DefaultTransformAdorner and GroupAdorner work with a single code path.
 */
export interface IElement extends Identifiable, Named {
  readonly transform: IMatrix;

  /**
   * Bounds in local space (before transform).
   * Returns points or rect data; adorners convert to world bounds using transform.
   */
  getLocalBounds(): number[][] | { minX: number; minY: number; maxX: number; maxY: number };

  /** Hit-test in local or world space. */
  hitTest(x: number, y: number): boolean;
}
