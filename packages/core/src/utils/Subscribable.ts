import { EventBus } from "../EventBus";

/**
 * A subscribable object that can be used to subscribe to and emit events.
 */
export class Subscribable<T extends string = string> {
  /**
   * The event bus for the subscribable object.
   */
  readonly events: EventBus<T> = new EventBus<T>();

  /**
   * Subscribe to an event.
   * @param event - The event name to subscribe to.
   * @param fn - The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  on(event: T, fn: (...args: unknown[]) => void): () => void {
    return this.events.on(event, fn);
  }

  /**
   * Unsubscribe from an event.
   * @param event - The event name to unsubscribe from.
   * @param fn - The callback function to remove.
   */
  off(event: T, fn: (...args: unknown[]) => void): void {
    this.events.off(event, fn);
  }

  /**
   * Emit an event.
   * @param event - The event name to emit.
   * @param args - The arguments to pass to the event handler.
   */
  emit(event: T, ...args: unknown[]): void {
    this.events.emit(event, ...args);
  }
}
