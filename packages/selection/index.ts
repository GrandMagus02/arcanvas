// Interfaces
export type { ISelectable, BoundingBox } from "./src/interfaces/ISelectable";
export type { IHandleRenderer, RenderContext } from "./src/interfaces/IHandleRenderer";
export type { IHandleStyle } from "./src/interfaces/IHandleStyle";

// Core classes
export { Handle, HandleType, EdgePosition, CornerPosition } from "./src/core/Handle";
export { HandleSet } from "./src/core/HandleSet";
export {
  HandleInteraction,
  InteractionType,
  type HandleInteractionData,
  type HandleInteractionCallback,
} from "./src/core/HandleInteraction";
export {
  SelectionManager,
  type SelectionChangeEvent,
  type SelectionChangeCallback,
} from "./src/core/SelectionManager";
