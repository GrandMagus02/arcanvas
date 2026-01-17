import type { InputPosition, NormalizedInputEvent } from "../types/InputEvent";
import type { ModifierKey } from "../types/ModifierKey";
import type { MouseButton } from "../types/MouseButton";

/**
 * State of an active pointer.
 */
export interface PointerState {
  id: number;
  position: InputPosition;
  buttons: MouseButton[];
  timestamp: number;
  device: string;
}

/**
 * Click event for multi-click detection.
 */
export interface ClickEvent {
  position: InputPosition;
  timestamp: number;
  button: MouseButton;
}

/**
 * Snapshot of input state at a point in time.
 */
export interface InputStateSnapshot {
  keysDown: Set<string>;
  activePointers: Map<number, PointerState>;
  modifiers: ModifierKey[];
  lastPosition: InputPosition | null;
  clickHistory: ClickEvent[];
}

/**
 * Centralized input state management.
 * Maintains current state of keys, pointers, modifiers, and click history.
 */
export class InputState {
  private _keysDown: Set<string> = new Set();
  private _activePointers: Map<number, PointerState> = new Map();
  private _modifiers: ModifierKey[] = [];
  private _lastPosition: InputPosition | null = null;
  private _clickHistory: ClickEvent[] = [];
  private _maxClickHistorySize: number = 10;

  /**
   * Updates state from a normalized input event.
   */
  update(event: NormalizedInputEvent): void {
    // Update keys
    if (event.type === "keydown" && event.key) {
      this._keysDown.add(event.key);
    } else if (event.type === "keyup" && event.key) {
      this._keysDown.delete(event.key);
    }

    // Update modifiers
    this._modifiers = [...event.modifiers];

    // Update pointers
    if (event.type === "pointerdown" || event.type === "touchstart") {
      let pointerId = 0;
      if (event.originalEvent) {
        if ("pointerId" in event.originalEvent) {
          pointerId = (event.originalEvent as PointerEvent).pointerId;
        } else if ("touches" in event.originalEvent && (event.originalEvent as TouchEvent).touches.length > 0) {
          pointerId = (event.originalEvent as TouchEvent).touches[0].identifier;
        }
      }
      this._activePointers.set(pointerId, {
        id: pointerId,
        position: event.position,
        buttons: event.buttons,
        timestamp: event.timestamp,
        device: event.device,
      });
    } else if (event.type === "pointerup" || event.type === "pointercancel" || event.type === "touchend" || event.type === "touchcancel") {
      let pointerId = 0;
      if (event.originalEvent) {
        if ("pointerId" in event.originalEvent) {
          pointerId = (event.originalEvent as PointerEvent).pointerId;
        } else if ("changedTouches" in event.originalEvent && (event.originalEvent as TouchEvent).changedTouches.length > 0) {
          pointerId = (event.originalEvent as TouchEvent).changedTouches[0].identifier;
        }
      }
      this._activePointers.delete(pointerId);
    } else if (event.type === "pointermove" || event.type === "touchmove" || event.type === "mousemove") {
      let pointerId = 0;
      if (event.originalEvent) {
        if ("pointerId" in event.originalEvent) {
          pointerId = (event.originalEvent as PointerEvent).pointerId;
        } else if ("touches" in event.originalEvent && (event.originalEvent as TouchEvent).touches.length > 0) {
          pointerId = (event.originalEvent as TouchEvent).touches[0].identifier;
        }
      }
      const existing = this._activePointers.get(pointerId);
      if (existing) {
        this._activePointers.set(pointerId, {
          ...existing,
          position: event.position,
          buttons: event.buttons,
          timestamp: event.timestamp,
        });
      }
    }

    // Update last position
    if (event.position) {
      this._lastPosition = event.position;
    }

    // Update click history
    if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
      if (event.buttons.length > 0) {
        this._clickHistory.push({
          position: event.position,
          timestamp: event.timestamp,
          button: event.buttons[0],
        });

        // Limit history size
        if (this._clickHistory.length > this._maxClickHistorySize) {
          this._clickHistory.shift();
        }
      }
    }
  }

  /**
   * Gets all currently pressed keys.
   */
  get keysDown(): Set<string> {
    return new Set(this._keysDown);
  }

  /**
   * Checks if a key is currently pressed.
   */
  isKeyDown(key: string): boolean {
    return this._keysDown.has(key);
  }

  /**
   * Gets all active pointers.
   */
  get activePointers(): Map<number, PointerState> {
    return new Map(this._activePointers);
  }

  /**
   * Gets a specific pointer by ID.
   */
  getPointer(id: number): PointerState | undefined {
    return this._activePointers.get(id);
  }

  /**
   * Gets currently pressed modifier keys.
   */
  get modifiers(): ModifierKey[] {
    return [...this._modifiers];
  }

  /**
   * Checks if a modifier key is pressed.
   */
  hasModifier(modifier: ModifierKey): boolean {
    return this._modifiers.includes(modifier);
  }

  /**
   * Gets the last known pointer position.
   */
  get lastPosition(): InputPosition | null {
    return this._lastPosition;
  }

  /**
   * Gets click history for multi-click detection.
   */
  get clickHistory(): ReadonlyArray<ClickEvent> {
    return [...this._clickHistory];
  }

  /**
   * Clears click history.
   */
  clearClickHistory(): void {
    this._clickHistory = [];
  }

  /**
   * Creates a snapshot of the current state.
   */
  snapshot(): InputStateSnapshot {
    return {
      keysDown: new Set(this._keysDown),
      activePointers: new Map(this._activePointers),
      modifiers: [...this._modifiers],
      lastPosition: this._lastPosition,
      clickHistory: [...this._clickHistory],
    };
  }

  /**
   * Resets all state.
   */
  reset(): void {
    this._keysDown.clear();
    this._activePointers.clear();
    this._modifiers = [];
    this._lastPosition = null;
    this._clickHistory = [];
  }

  /**
   * Sets the maximum click history size.
   */
  setMaxClickHistorySize(size: number): void {
    this._maxClickHistorySize = size;
    // Trim if necessary
    if (this._clickHistory.length > size) {
      this._clickHistory = this._clickHistory.slice(-size);
    }
  }
}
