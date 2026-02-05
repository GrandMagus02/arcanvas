/**
 * Interaction metadata.
 */
export type InteractionMetadata = Record<string, unknown>;

/**
 * Interaction event.
 */
export interface InteractionEvent<TNativeEvent extends Event = Event> {
  originalEvent: TNativeEvent;
  target: HTMLElement;
  type: string;
  metadata?: InteractionMetadata;
}

/**
 * Base interaction class.
 */
export abstract class Interaction<TEvent extends InteractionEvent = InteractionEvent> {
  public abstract readonly name: string;
  protected abstract readonly eventMap: Record<string, (event: Event) => void>;
  private __elements: HTMLElement[] = [];
  private __listeners: WeakMap<HTMLElement, Record<string, EventListener>> = new WeakMap();
  protected _callback?: (event: TEvent) => void;

  constructor(callback?: (event: TEvent) => void) {
    this._callback = callback;
  }

  public get elements(): Readonly<HTMLElement[]> {
    return Object.freeze(this.__elements);
  }

  public watch(element: HTMLElement): void {
    // If already watching, unwatch first to update listeners/metadata safely
    if (this.__elements.includes(element)) {
      this.unwatch(element);
    }
    this.__elements.push(element);
    const listeners: Record<string, EventListener> = {};

    for (const [event, callback] of Object.entries(this.eventMap)) {
      const boundCallback = callback.bind(this) as EventListener;
      element.addEventListener(event, boundCallback);
      listeners[event] = boundCallback;
    }
    this.__listeners.set(element, listeners);
  }

  public unwatch(element: HTMLElement): void {
    const listeners = this.__listeners.get(element);
    if (listeners) {
      for (const [event, callback] of Object.entries(listeners)) {
        element.removeEventListener(event, callback);
      }
      this.__listeners.delete(element);
    }
    this.__elements = this.__elements.filter((e) => e !== element);
  }

  public unwatchAll(): void {
    for (const element of this.__elements) {
      this.unwatch(element);
    }
    this.__elements = [];
  }
}
