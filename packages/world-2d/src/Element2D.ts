import { Matrix3, uuid } from "@arcanvas/core";
import type { IElement } from "@arcanvas/world";

/**
 * Base element with geometry and transform.
 * Exposes minimal interface for selection adorners; no selection UI details.
 */
export abstract class Element2D implements IElement {
  readonly id: string;
  readonly name: string = "element";
  readonly transform: Matrix3;

  constructor(id: string = uuid(), transform: Matrix3 = Matrix3.identity()) {
    this.id = id;
    this.transform = transform;
  }

  /** Bounds in local space (before transform). */
  abstract getLocalBounds(): number[][] | { minX: number; minY: number; maxX: number; maxY: number };

  /** Hit-test in local or world space. */
  abstract hitTest(x: number, y: number): boolean;
}
