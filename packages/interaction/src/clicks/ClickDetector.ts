import type { InputState } from "../state/InputState";
import type { InputPosition, NormalizedInputEvent } from "../types/InputEvent";
import type { ClickConfig } from "./ClickConfig";

/**
 * Multi-click detector for single, double, triple, and N-click patterns.
 */
export class ClickDetector {
  private _config: Required<ClickConfig>;
  private _clickTimeout: number | null = null;
  private _pendingClicks: Array<{ position: InputPosition; button: number; timestamp: number }> = [];

  constructor(config: ClickConfig = {}) {
    this._config = {
      timeout: config.timeout ?? 300,
      radius: config.radius ?? 5,
      onClick: config.onClick ?? (() => {}),
      onDoubleClick: config.onDoubleClick ?? (() => {}),
      onTripleClick: config.onTripleClick ?? (() => {}),
      onNClick: config.onNClick ?? (() => {}),
    };
  }

  /**
   * Calculates distance between two positions.
   */
  private _distance(pos1: InputPosition, pos2: InputPosition): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Processes pending clicks after timeout.
   */
  private _processPendingClicks(): void {
    if (this._pendingClicks.length === 0) return;

    const count = this._pendingClicks.length;
    const lastClick = this._pendingClicks[this._pendingClicks.length - 1];

    if (count === 1) {
      this._config.onClick(lastClick.position, lastClick.button);
    } else if (count === 2) {
      this._config.onDoubleClick(lastClick.position, lastClick.button);
    } else if (count === 3) {
      this._config.onTripleClick(lastClick.position, lastClick.button);
    } else {
      this._config.onNClick(count, lastClick.position, lastClick.button);
    }

    this._pendingClicks = [];
  }

  /**
   * Handles an input event.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(event: NormalizedInputEvent, _state: InputState): void {
    if (event.type === "mousedown" || event.type === "pointerdown" || event.type === "touchstart") {
      if (event.buttons.length === 0) return;

      const button = event.buttons[0];
      const position = event.position;
      const timestamp = event.timestamp;

      // Check if this is a continuation of a click sequence
      if (this._pendingClicks.length > 0) {
        const lastClick = this._pendingClicks[this._pendingClicks.length - 1];
        const timeSinceLastClick = timestamp - lastClick.timestamp;
        const distance = this._distance(position, lastClick.position);

        if (timeSinceLastClick <= this._config.timeout && distance <= this._config.radius && Number(lastClick.button) === Number(button)) {
          // Continue sequence
          this._pendingClicks.push({ position, button, timestamp });
          if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
          }
          this._clickTimeout = setTimeout(() => {
            this._processPendingClicks();
            this._clickTimeout = null;
          }, this._config.timeout);
          return;
        } else {
          // Sequence broken, process previous clicks
          this._processPendingClicks();
          if (this._clickTimeout) {
            clearTimeout(this._clickTimeout);
            this._clickTimeout = null;
          }
        }
      }

      // Start new click sequence
      this._pendingClicks = [{ position, button, timestamp }];
      this._clickTimeout = setTimeout(() => {
        this._processPendingClicks();
        this._clickTimeout = null;
      }, this._config.timeout);
    }
  }

  /**
   * Resets the detector state.
   */
  reset(): void {
    if (this._clickTimeout) {
      clearTimeout(this._clickTimeout);
      this._clickTimeout = null;
    }
    this._pendingClicks = [];
  }
}
