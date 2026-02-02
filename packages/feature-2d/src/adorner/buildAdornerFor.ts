import type { ISelectionAdorner } from "@arcanvas/selection";
import type { IElementWithBoundsAndTransform } from "./DefaultTransformAdorner";
import { DefaultTransformAdorner } from "./DefaultTransformAdorner";
import { GroupAdorner } from "./GroupAdorner";
import type { ITextElement } from "./TextExtrasAdorner";
import { TextExtrasAdorner } from "./TextExtrasAdorner";

/**
 * Build the appropriate adorner for the current selection.
 * - Multiple elements: GroupAdorner (combined bounds, transform all).
 * - Single element: DefaultTransformAdorner, optionally wrapped with TextExtrasAdorner if element.type === "text".
 */
export function buildAdornerFor(elements: IElementWithBoundsAndTransform[]): ISelectionAdorner<IElementWithBoundsAndTransform | IElementWithBoundsAndTransform[]> | null {
  if (elements.length === 0) return null;
  if (elements.length > 1) {
    return new GroupAdorner();
  }
  const el = elements[0]!;
  const base = new DefaultTransformAdorner();
  if (el.type === "text" || (el as ITextElement).kerning !== undefined) {
    return new TextExtrasAdorner(base);
  }
  return base;
}
