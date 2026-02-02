import type { BoundingBox, DragInfo, Handle, ISelectionAdorner } from "@arcanvas/selection";

/**
 * Base decorator for selection adorners.
 * Delegates all methods to the wrapped adorner; subclasses override to add or change behavior.
 */
export abstract class AdornerDecorator<T> implements ISelectionAdorner<T> {
  constructor(protected readonly base: ISelectionAdorner<T>) {}

  getBounds(el: T): BoundingBox | null {
    return this.base.getBounds(el);
  }

  getHandles(el: T): Handle[] {
    return this.base.getHandles(el);
  }

  dragHandle(el: T, handleId: string, drag: DragInfo): void {
    return this.base.dragHandle(el, handleId, drag);
  }

  getMeshes?(el: T): unknown[] {
    return this.base.getMeshes?.(el) ?? [];
  }
}
