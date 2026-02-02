import { applyMixins, EventBusMixin } from "../../utils/mixins";
import type { EventEmitter } from "../interfaces";

/**
 * Thin wrapper around EventBus providing a clean interface for event management.
 */
export class EventSystem implements EventEmitter {
  static {
    applyMixins(EventSystem, [EventBusMixin]);
  }

  declare on: (event: string, fn: (...args: unknown[]) => void) => () => void;
  declare once: (event: string, fn: (...args: unknown[]) => void) => () => void;
  declare off: (event: string, fn: (...args: unknown[]) => void) => void;
  declare emit: (event: string, ...args: unknown[]) => void;
}
