import { EventBus } from "../infrastructure/events/EventBus";
import type { EventMap } from "../infrastructure/events/EventMap";

/**
 * Helper type to convert a string union to an EventMap.
 * Useful for backward compatibility with code that uses string event names.
 */
export type StringToEventMap<T extends string> = Record<T, unknown[]>;

/**
 * A subscribable object that can be used to subscribe to and emit events.
 *
 * @template T The event map type that defines event names and their argument types.
 *             For backward compatibility, can also be a string union type.
 *
 * @example
 * ```typescript
 * // Using EventMap (recommended)
 * interface MyEvents extends EventMap {
 *   click: [event: MouseEvent];
 *   resize: [width: number, height: number];
 * }
 * class MyClass extends Subscribable<MyEvents> {}
 *
 * // Using string union (backward compatible)
 * class MyClass extends Subscribable<"click" | "resize"> {}
 * ```
 */
export class Subscribable<T extends EventMap | string = Record<string, unknown[]>> {
  /**
   * The event bus for the subscribable object.
   */
  readonly events: EventBus<T extends string ? StringToEventMap<T> : T> = new EventBus<T extends string ? StringToEventMap<T> : T>();

  /**
   * Subscribe to an event.
   * @param event - The event name to subscribe to.
   * @param fn - The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  on<K extends keyof (T extends string ? StringToEventMap<T> : T)>(event: K, fn: (...args: (T extends string ? StringToEventMap<T> : T)[K]) => void): () => void {
    return this.events.on(event, fn);
  }

  /**
   * Unsubscribe from an event.
   * @param event - The event name to unsubscribe from.
   * @param fn - The callback function to remove.
   */
  off<K extends keyof (T extends string ? StringToEventMap<T> : T)>(event: K, fn: (...args: (T extends string ? StringToEventMap<T> : T)[K]) => void): void {
    this.events.off(event, fn);
  }

  /**
   * Emit an event.
   * @param event - The event name to emit.
   * @param args - The arguments to pass to the event handler.
   */
  emit<K extends keyof (T extends string ? StringToEventMap<T> : T)>(event: K, ...args: (T extends string ? StringToEventMap<T> : T)[K]): void {
    this.events.emit(event, ...args);
  }
}
