import type { Vector2 } from "@arcanvas/math";
import type { Handle } from "./Handle";

/**
 * Type of interaction being performed on a handle.
 */
export enum InteractionType {
  Resize = "resize",
  Rotate = "rotate",
  Move = "move",
}

/**
 * Data for handle interaction events.
 */
export interface HandleInteractionData {
  /**
   * The handle being interacted with.
   */
  handle: Handle;

  /**
   * Type of interaction.
   */
  type: InteractionType;

  /**
   * Starting position (in world coordinates).
   */
  startPosition: Vector2;

  /**
   * Current position (in world coordinates).
   */
  currentPosition: Vector2;

  /**
   * Delta from start position.
   */
  delta: Vector2;

  /**
   * Incremental delta from last update.
   */
  incrementalDelta: Vector2;
}

/**
 * Callback type for handle interaction events.
 */
export type HandleInteractionCallback = (data: HandleInteractionData) => void;

/**
 * Manages drag interactions on handles.
 * Calculates transform deltas and emits interaction events.
 */
export class HandleInteraction {
  private _activeHandle: Handle | null = null;
  private _startPosition: Vector2 | null = null;
  private _currentPosition: Vector2 | null = null;
  private _lastPosition: Vector2 | null = null;
  private _onInteraction: HandleInteractionCallback | null = null;

  /**
   * Sets the callback for interaction events.
   */
  setInteractionCallback(callback: HandleInteractionCallback | null): void {
    this._onInteraction = callback;
  }

  /**
   * Starts an interaction with a handle.
   * @param handle - The handle to interact with
   * @param startPosition - Starting position in world coordinates
   */
  start(handle: Handle, startPosition: Vector2): void {
    this._activeHandle = handle;
    this._startPosition = startPosition;
    this._currentPosition = startPosition;
  }

  /**
   * Updates the current position during an interaction.
   * @param currentPosition - Current position in world coordinates
   */
  update(currentPosition: Vector2): void {
    if (!this._activeHandle || !this._startPosition) {
      return;
    }

    this._currentPosition = currentPosition;

    const delta: Vector2 = {
      x: currentPosition.x - this._startPosition.x,
      y: currentPosition.y - this._startPosition.y,
    } as Vector2;

    const incrementalDelta: Vector2 = {
      x: currentPosition.x - (this._lastPosition?.x ?? this._startPosition.x),
      y: currentPosition.y - (this._lastPosition?.y ?? this._startPosition.y),
    } as Vector2;

    this._lastPosition = { x: currentPosition.x, y: currentPosition.y } as Vector2;

    const interactionType = this._activeHandle.type === "rotation" ? InteractionType.Rotate : InteractionType.Resize;

    if (this._onInteraction) {
      this._onInteraction({
        handle: this._activeHandle,
        type: interactionType,
        startPosition: this._startPosition,
        currentPosition,
        delta,
        incrementalDelta,
      });
    }
  }

  /**
   * Ends the current interaction.
   */
  end(): void {
    this._activeHandle = null;
    this._startPosition = null;
    this._currentPosition = null;
    this._lastPosition = null;
  }

  /**
   * Cancels the current interaction.
   */
  cancel(): void {
    this.end();
  }

  /**
   * Gets the currently active handle, or null if no interaction is active.
   */
  get activeHandle(): Handle | null {
    return this._activeHandle;
  }

  /**
   * Checks if an interaction is currently active.
   */
  get isActive(): boolean {
    return this._activeHandle !== null;
  }
}
