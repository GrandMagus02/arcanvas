import { EventBus } from "../../infrastructure/events/EventBus";
import type { EventMap } from "../../infrastructure/events/EventMap";
import type { EventEmitter } from "../../infrastructure/interfaces/EventEmitter";

/**
 * Mixin class that provides type-safe event bus functionality for event-driven objects.
 *
 * Classes using this mixin will implement the EventEmitter interface,
 * allowing them to emit and subscribe to events with full type safety.
 *
 * @template T The event map type that defines event names and their argument types.
 *
 * @example
 * ```typescript
 * interface MyEvents extends EventMap {
 *   click: [event: MouseEvent];
 *   resize: [width: number, height: number];
 * }
 *
 * class MyClass {
 *   static {
 *     applyMixins(MyClass, [EventBusMixin]);
 *   }
 *
 *   declare on: <K extends keyof MyEvents>(
 *     event: K,
 *     fn: (...args: MyEvents[K]) => void
 *   ) => () => void;
 * }
 *
 * const instance = new MyClass();
 * instance.on("click", (event) => {
 *   // TypeScript knows event is MouseEvent
 * });
 * ```
 */
export abstract class EventBusMixin<T extends EventMap = Record<string, unknown[]>> implements EventEmitter<T> {
  private _eventBus = new EventBus<T>();

  /**
   * Subscribe to an event.
   * @param event The event name to subscribe to.
   * @param fn The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  on<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void {
    return this._eventBus.on(event, fn);
  }

  /**
   * Subscribe to an event once.
   * @param event The event name to subscribe to.
   * @param fn The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  once<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void {
    return this._eventBus.once(event, fn);
  }

  /**
   * Unsubscribe from an event.
   * @param event The event name to unsubscribe from.
   * @param fn The callback function to remove.
   */
  off<K extends keyof T>(event: K, fn: (...args: T[K]) => void): void {
    this._eventBus.off(event, fn);
  }

  /**
   * Emit an event.
   * @param event The event name to emit.
   * @param args Arguments to pass to event handlers.
   */
  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this._eventBus.emit(event, ...args);
  }

  /**
   * Gets the underlying EventBus instance.
   * Useful when you need direct access to EventBus methods.
   */
  protected get eventBus(): EventBus<T> {
    return this._eventBus;
  }
}
