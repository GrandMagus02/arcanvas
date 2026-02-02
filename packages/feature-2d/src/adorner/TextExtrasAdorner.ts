import type { RenderObject } from "@arcanvas/graphics";
import { Vector2 } from "@arcanvas/math";
import type { DragInfo } from "@arcanvas/selection";
import { Handle, HandleType } from "@arcanvas/selection";
import { AdornerDecorator } from "./AdornerDecorator";
import type { IElementWithBoundsAndTransform } from "./DefaultTransformAdorner";

const HANDLE_SIZE = 8;

/**
 * Element that has text-specific params (kerning, leading) for TextExtrasAdorner.
 */
export interface ITextElement extends IElementWithBoundsAndTransform {
  kerning?: number;
  leading?: number;
}

/**
 * Decorator that adds kerning and leading handles to the default transform adorner.
 * Transform handles (move/resize/rotate) are delegated to the base; parametric handles
 * (kerning, leading) update element params.
 */
export class TextExtrasAdorner extends AdornerDecorator<ITextElement> {
  getHandles(el: ITextElement): ReturnType<AdornerDecorator<ITextElement>["getHandles"]> {
    const baseHandles = this.base.getHandles(el);
    const bounds = this.base.getBounds(el);
    if (!bounds) return baseHandles;
    const center = bounds.getCenter();
    const HIT_SIZE = 20;
    const extraHandles = [
      new Handle(HandleType.Edge, Vector2.of(center.x + 40, center.y), HIT_SIZE, "ew-resize", "kerning"),
      new Handle(HandleType.Edge, Vector2.of(center.x, center.y - 20), HIT_SIZE, "ns-resize", "leading"),
    ];
    return [...baseHandles, ...extraHandles];
  }

  dragHandle(el: ITextElement, handleId: string, drag: DragInfo): void {
    if (handleId === "kerning") {
      if (el.kerning !== undefined) el.kerning += drag.delta.x * 0.01;
      return;
    }
    if (handleId === "leading") {
      if (el.leading !== undefined) el.leading -= drag.delta.y * 0.01;
      return;
    }
    this.base.dragHandle(el, handleId, drag);
  }

  getMeshes(el: ITextElement, context?: unknown): RenderObject[] {
    const baseMeshes = (this.base.getMeshes?.(el, context) ?? []) as RenderObject[];
    return [...baseMeshes];
  }
}
