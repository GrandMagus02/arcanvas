/**
 * A function that can be used to handle an event.
 */
export type HookFn = (...args: unknown[]) => void;

/**
 * A event bus that can be used to emit and subscribe to events.
 */
export class EventBus {
  private map = new Map<string, Set<HookFn>>();

  on(event: string, fn: HookFn) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  once(event: string, fn: HookFn) {
    const off = this.on(event, (...args) => {
      off();
      fn(...args);
    });
    return off;
  }

  off(event: string, fn: HookFn) {
    this.map.get(event)?.delete(fn);
  }

  emit(event: string, ...args: unknown[]) {
    this.map.get(event)?.forEach((fn) => fn(...args));
  }
}
