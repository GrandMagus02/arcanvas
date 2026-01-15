import type { EventBus } from "../events/EventBus";
import type { EventMap } from "../events/EventMap";

/**
 * Options for configuring a canvas host.
 */
export interface CanvasOptions {
  width: number;
  height: number;
  focusable: boolean;
}

/**
 * Default canvas options.
 */
export const DEFAULT_CANVAS_OPTIONS: CanvasOptions = Object.freeze({
  width: 100,
  height: 100,
  focusable: true,
});

/**
 * Event map constraint for CanvasHost.
 * Ensures the event map includes the events that CanvasHost emits.
 */
export interface CanvasHostEvents extends EventMap {
  resize: [width: number, height: number];
  focus: [];
  blur: [];
}

/**
 * Manages DOM canvas element, dimensions, DPR, and focus state.
 */
export class CanvasHost<T extends CanvasHostEvents = CanvasHostEvents> {
  private _canvas: HTMLCanvasElement;
  private _options: CanvasOptions;
  private _events: EventBus<T>;
  private _isFocused = false;

  constructor(canvas: HTMLCanvasElement, options: Partial<CanvasOptions>, events: EventBus<T>) {
    this._canvas = canvas;
    this._options = { ...DEFAULT_CANVAS_OPTIONS, ...options };
    this._events = events;

    this.applyOptions();
    this.applyDprSizing();
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  get options(): CanvasOptions {
    return this._options;
  }

  get isFocused(): boolean {
    return this._isFocused;
  }

  updateOptions(options: Partial<CanvasOptions>): void {
    const oldWidth = this._canvas.width;
    const oldHeight = this._canvas.height;

    Object.assign(this._options, options);
    this.applyOptions();
    this.applyDprSizing();

    if (this._canvas.width !== oldWidth || this._canvas.height !== oldHeight) {
      this._events.emit("resize", this._canvas.width, this._canvas.height);
    }
  }

  resize(width: number, height: number): void {
    const oldWidth = this._canvas.width;
    const oldHeight = this._canvas.height;

    if (Number.isFinite(width) && width > 0) {
      this._canvas.width = Math.floor(width);
    }
    if (Number.isFinite(height) && height > 0) {
      this._canvas.height = Math.floor(height);
    }

    this._options.width = this._canvas.width;
    this._options.height = this._canvas.height;

    if (this._canvas.width !== oldWidth || this._canvas.height !== oldHeight) {
      // Type assertion: T extends CanvasHostEvents, so "resize" exists with [number, number]
      (this._events.emit as unknown as (event: "resize", ...args: [number, number]) => void)("resize", this._canvas.width, this._canvas.height);
    }
  }

  private applyOptions(): void {
    const { width, height, focusable } = this._options;

    if (typeof width === "number") this._canvas.width = width;
    if (typeof height === "number") this._canvas.height = height;

    if (focusable) {
      this._canvas.addEventListener("click", () => {
        this._canvas.focus();
      });
      this._canvas.setAttribute("tabindex", "0");

      this._canvas.addEventListener("focus", () => {
        this._isFocused = true;
        // Type assertion: T extends CanvasHostEvents, so "focus" exists with []
        (this._events.emit as unknown as (event: "focus") => void)("focus");
      });

      this._canvas.addEventListener("blur", () => {
        this._isFocused = false;
        // Type assertion: T extends CanvasHostEvents, so "blur" exists with []
        (this._events.emit as unknown as (event: "blur") => void)("blur");
      });
    }
  }

  private applyDprSizing(): void {
    const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;

    const hasExplicitWidth = typeof this._options.width === "number" && this._options.width > 0;
    const hasExplicitHeight = typeof this._options.height === "number" && this._options.height > 0;

    if (!hasExplicitWidth || !hasExplicitHeight) {
      const parent = this._canvas.parentElement;
      if (parent) {
        const cssWidth = Math.max(0, Math.floor(parent.clientWidth || 0));
        const cssHeight = Math.max(0, Math.floor(parent.clientHeight || 0));
        const width = Math.max(0, Math.floor(cssWidth * dpr));
        const height = Math.max(0, Math.floor(cssHeight * dpr));

        if (width || height) {
          this.resize(width || this._canvas.width, height || this._canvas.height);
        }
      }
    }
  }
}
