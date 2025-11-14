/**
 * A function that can be used to handle an event.
 */
export type HookFn = (...args: unknown[]) => void;

/**
 * A event bus that can be used to emit and subscribe to events.
 */
export class EventBus<T extends string = string> {
  private map = new Map<T, Set<HookFn>>();

  on(event: T, fn: HookFn) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  once(event: T, fn: HookFn) {
    const off = this.on(event, (...args) => {
      off();
      fn(...args);
    });
    return off;
  }

  off(event: T, fn: HookFn) {
    this.map.get(event)?.delete(fn);
  }

  emit(event: T, ...args: unknown[]) {
    this.map.get(event)?.forEach((fn) => fn(...args));
  }
}
