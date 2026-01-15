import type { EventEmitter } from "../interfaces";
import type { EventMap } from "./EventMap";

/**
 * A function that can be used to handle an event.
 */
export type HookFn = (...args: unknown[]) => void;

/**
 * A type-safe event bus that can be used to emit and subscribe to events.
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
 * const bus = new EventBus<MyEvents>();
 * bus.on("click", (event) => {
 *   // TypeScript knows event is MouseEvent
 * });
 * bus.emit("resize", 800, 600);
 * ```
 */
export class EventBus<T extends EventMap = Record<string, unknown[]>> implements EventEmitter<T> {
  private map = new Map<keyof T & string, Set<HookFn>>();

  on<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void {
    const eventKey = event as keyof T & string;
    if (!this.map.has(eventKey)) this.map.set(eventKey, new Set());
    this.map.get(eventKey)!.add(fn as HookFn);
    return () => this.off(event, fn);
  }

  once<K extends keyof T>(event: K, fn: (...args: T[K]) => void): () => void {
    const off = this.on(event, (...args) => {
      off();
      fn(...args);
    });
    return off;
  }

  off<K extends keyof T>(event: K, fn: (...args: T[K]) => void): void {
    this.map.get(event as keyof T & string)?.delete(fn as HookFn);
  }

  emit<K extends keyof T>(event: K, ...args: T[K]): void {
    this.map.get(event as keyof T & string)?.forEach((fn) => (fn as (...args: T[K]) => void)(...args));
  }
}
