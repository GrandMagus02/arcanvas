/**
 * @arcanvas/runtime - Typed Event Bus
 *
 * A strongly-typed pub/sub event system.
 */

/**
 * Event handler function type.
 */
export type EventHandler<T> = (event: T) => void;

/**
 * Unsubscribe function returned by subscribe.
 */
export type Unsubscribe = () => void;

/**
 * Event map type - maps event names to their payload types.
 * Use interface extension to define your events.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventMap {}

/**
 * Typed event bus for publish/subscribe communication.
 *
 * @typeParam T - Event map defining available events and their payloads
 *
 * @example
 * ```ts
 * interface MyEvents {
 *   'resize': { width: number; height: number };
 *   'frame': { deltaTime: number };
 *   'error': Error;
 * }
 *
 * const bus = new EventBus<MyEvents>();
 *
 * const unsub = bus.on('resize', ({ width, height }) => {
 *   console.log(`Resized to ${width}x${height}`);
 * });
 *
 * bus.emit('resize', { width: 800, height: 600 });
 *
 * unsub(); // Stop listening
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class EventBus<T = any> {
  private readonly _handlers: Map<keyof T, Set<EventHandler<unknown>>> = new Map();

  /**
   * Subscribe to an event.
   *
   * @param event - Event name
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
    let handlers = this._handlers.get(event);
    if (!handlers) {
      handlers = new Set();
      this._handlers.set(event, handlers);
    }
    handlers.add(handler as EventHandler<unknown>);

    return () => {
      handlers.delete(handler as unknown as EventHandler<unknown>);
      if (handlers.size === 0) {
        this._handlers.delete(event);
      }
    };
  }

  /**
   * Subscribe to an event, but only trigger once.
   *
   * @param event - Event name
   * @param handler - Handler function
   * @returns Unsubscribe function
   */
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): Unsubscribe {
    const unsub = this.on(event, (payload) => {
      unsub();
      handler(payload);
    });
    return unsub;
  }

  /**
   * Emit an event to all subscribers.
   *
   * @param event - Event name
   * @param payload - Event payload
   */
  emit<K extends keyof T>(event: K, payload: T[K]): void {
    const handlers = this._handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in event handler for '${String(event)}':`, error);
        }
      }
    }
  }

  /**
   * Remove all handlers for an event.
   *
   * @param event - Event name
   */
  off<K extends keyof T>(event: K): void {
    this._handlers.delete(event);
  }

  /**
   * Remove all handlers for all events.
   */
  clear(): void {
    this._handlers.clear();
  }

  /**
   * Get the number of handlers for an event.
   *
   * @param event - Event name
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this._handlers.get(event)?.size ?? 0;
  }

  /**
   * Check if there are any handlers for an event.
   *
   * @param event - Event name
   */
  hasListeners<K extends keyof T>(event: K): boolean {
    return this.listenerCount(event) > 0;
  }
}

/**
 * Create a new typed event bus.
 */
export function createEventBus<T>(): EventBus<T> {
  return new EventBus<T>();
}
