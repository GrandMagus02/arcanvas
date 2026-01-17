import type { InputState } from "../state/InputState";
import type { NormalizedInputEvent } from "../types/InputEvent";

/**
 * Base interface for all gesture handlers.
 */
export interface GestureHandler<TConfig = unknown> {
  onStart?(state: InputState, event: NormalizedInputEvent, config: TConfig): void;
  onUpdate?(state: InputState, event: NormalizedInputEvent, config: TConfig): void;
  onEnd?(state: InputState, event: NormalizedInputEvent, config: TConfig): void;
  onCancel?(state: InputState, reason: string, config: TConfig): void;
}

/**
 * Gesture state machine states.
 */
export enum GestureState {
  Idle = "idle",
  Detecting = "detecting",
  Active = "active",
  Complete = "complete",
  Cancelled = "cancelled",
}
