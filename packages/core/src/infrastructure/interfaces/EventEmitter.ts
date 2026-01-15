import type { EventMap } from "../events/EventMap";

/**
 * Interface for objects that can emit and subscribe to events with type safety.
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
 * class MyEmitter implements EventEmitter<MyEvents> {
 *   on<K extends keyof MyEvents>(event: K, fn: (...args: MyEvents[K]) => void): () => void {
 *     // implementation
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface EventEmitter<T extends EventMap = Record<string, unknown[]>> {
  /**
   * Subscribe to an event.
   * @param event The event name to subscribe to.
   * @param fn The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  on<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void;

  /**
   * Subscribe to an event once.
   * @param event The event name to subscribe to.
   * @param fn The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  once<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void;

  /**
   * Unsubscribe from an event.
   * @param event The event name to unsubscribe from.
   * @param fn The callback function to remove.
   */
  off<K extends keyof T>(event: K, fn: (...args: T[K]) => void): void;

  /**
   * Emit an event.
   * @param event The event name to emit.
   * @param args Arguments to pass to event handlers.
   */
  emit<K extends keyof T>(event: K, ...args: T[K]): void;
}
