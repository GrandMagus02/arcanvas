/**
 * @arcanvas/world - World / document element abstractions
 *
 * Provides minimal element interface for selection and adorners:
 * - IElement: transform + getLocalBounds + hitTest + optional type
 * - Element: abstract base implementing IElement
 */

export { Element } from "./src/Element";
export type { IElement } from "./src/interfaces/IElement";
