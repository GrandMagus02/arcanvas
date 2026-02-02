// Interfaces
export type { IHandleRenderer, RenderContext } from "./src/interfaces/IHandleRenderer";
export type { IHandleStyle } from "./src/interfaces/IHandleStyle";
export type { BoundingBox, ISelectable } from "./src/interfaces/ISelectable";
export type { DragInfo, ISelectionAdorner } from "./src/interfaces/ISelectionAdorner";

// Core classes
export { CornerPosition, EdgePosition, Handle, HandleType } from "./src/core/Handle";
export { HandleInteraction, InteractionType, type HandleInteractionCallback, type HandleInteractionData } from "./src/core/HandleInteraction";
export { HandleSet } from "./src/core/HandleSet";
export { SelectionManager, type SelectionChangeCallback, type SelectionChangeEvent } from "./src/core/SelectionManager";
