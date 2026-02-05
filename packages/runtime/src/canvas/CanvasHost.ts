/**
 * @arcanvas/runtime - Canvas Host
 *
 * Manages canvas element lifecycle, sizing, and device pixel ratio handling.
 */

import type { EventBus } from "../events/EventBus.js";
import { createEventBus } from "../events/EventBus.js";

/**
 * Canvas host events.
 */
export interface CanvasHostEvents {
  /** Fired when canvas size changes */
  resize: { width: number; height: number; devicePixelRatio: number };
  /** Fired when device pixel ratio changes */
  dprChange: { devicePixelRatio: number };
  /** Fired when visibility changes */
  visibilityChange: { visible: boolean };
}

/**
 * Canvas host configuration.
 */
export interface CanvasHostConfig {
  /** Canvas element or selector */
  canvas: HTMLCanvasElement | string;
  /** Whether to automatically handle resizing (default: true) */
  autoResize?: boolean;
  /** Whether to handle device pixel ratio (default: true) */
  handleDpr?: boolean;
  /** Maximum device pixel ratio (default: 2) */
  maxDpr?: number;
  /** Whether to handle visibility changes (default: true) */
  handleVisibility?: boolean;
}

/**
 * Canvas host - manages a canvas element for rendering.
 *
 * @example
 * ```ts
 * const host = new CanvasHost({
 *   canvas: '#my-canvas',
 *   autoResize: true,
 *   handleDpr: true,
 * });
 *
 * host.events.on('resize', ({ width, height }) => {
 *   renderer.resize(width, height);
 * });
 *
 * // Get canvas for gfx adapter
 * const adapter = await requestAdapter({ canvas: host.canvas });
 * ```
 */
export class CanvasHost {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _events: EventBus<CanvasHostEvents>;
  private readonly _maxDpr: number;
  private readonly _handleDpr: boolean;

  private _resizeObserver: ResizeObserver | null = null;
  private _dprMediaQuery: MediaQueryList | null = null;
  private _width = 0;
  private _height = 0;
  private _devicePixelRatio = 1;
  private _visible = true;
  private _disposed = false;

  constructor(config: CanvasHostConfig) {
    // Resolve canvas element
    if (typeof config.canvas === "string") {
      const element = document.querySelector(config.canvas);
      if (!(element instanceof HTMLCanvasElement)) {
        throw new Error(`Canvas not found: ${config.canvas}`);
      }
      this._canvas = element;
    } else {
      this._canvas = config.canvas;
    }

    this._events = createEventBus();
    this._maxDpr = config.maxDpr ?? 2;
    this._handleDpr = config.handleDpr ?? true;

    // Initial size
    this.updateSize();

    // Set up auto-resize
    if (config.autoResize ?? true) {
      this.setupResizeObserver();
    }

    // Set up DPR handling
    if (this._handleDpr) {
      this.setupDprObserver();
    }

    // Set up visibility handling
    if (config.handleVisibility ?? true) {
      this.setupVisibilityObserver();
    }
  }

  /**
   * The canvas element.
   */
  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  /**
   * Event bus for canvas events.
   */
  get events(): EventBus<CanvasHostEvents> {
    return this._events;
  }

  /**
   * Current canvas width in pixels.
   */
  get width(): number {
    return this._width;
  }

  /**
   * Current canvas height in pixels.
   */
  get height(): number {
    return this._height;
  }

  /**
   * Current device pixel ratio.
   */
  get devicePixelRatio(): number {
    return this._devicePixelRatio;
  }

  /**
   * Whether the canvas is currently visible.
   */
  get visible(): boolean {
    return this._visible;
  }

  /**
   * CSS width of the canvas.
   */
  get cssWidth(): number {
    return this._canvas.clientWidth;
  }

  /**
   * CSS height of the canvas.
   */
  get cssHeight(): number {
    return this._canvas.clientHeight;
  }

  /**
   * Update canvas size based on CSS dimensions and DPR.
   */
  private updateSize(): void {
    const dpr = this._handleDpr ? Math.min(window.devicePixelRatio || 1, this._maxDpr) : 1;

    const cssWidth = this._canvas.clientWidth;
    const cssHeight = this._canvas.clientHeight;

    const pixelWidth = Math.floor(cssWidth * dpr);
    const pixelHeight = Math.floor(cssHeight * dpr);

    const sizeChanged = this._width !== pixelWidth || this._height !== pixelHeight;
    const dprChanged = this._devicePixelRatio !== dpr;

    if (sizeChanged || dprChanged) {
      this._width = pixelWidth;
      this._height = pixelHeight;
      this._devicePixelRatio = dpr;

      // Update canvas backing store size
      this._canvas.width = pixelWidth;
      this._canvas.height = pixelHeight;

      if (sizeChanged) {
        this._events.emit("resize", {
          width: pixelWidth,
          height: pixelHeight,
          devicePixelRatio: dpr,
        });
      }

      if (dprChanged) {
        this._events.emit("dprChange", { devicePixelRatio: dpr });
      }
    }
  }

  /**
   * Set up ResizeObserver for auto-resize.
   */
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === "undefined") {
      // Fallback to window resize
      window.addEventListener("resize", this.handleWindowResize);
      return;
    }

    this._resizeObserver = new ResizeObserver(() => {
      if (!this._disposed) {
        this.updateSize();
      }
    });

    this._resizeObserver.observe(this._canvas);
  }

  private handleWindowResize = (): void => {
    if (!this._disposed) {
      this.updateSize();
    }
  };

  /**
   * Set up DPR change observer.
   */
  private setupDprObserver(): void {
    if (typeof window.matchMedia === "undefined") return;

    const updateDprQuery = () => {
      this._dprMediaQuery?.removeEventListener("change", this.handleDprChange);
      this._dprMediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      this._dprMediaQuery.addEventListener("change", this.handleDprChange);
    };

    updateDprQuery();
  }

  private handleDprChange = (): void => {
    if (!this._disposed) {
      this.updateSize();
      // Re-setup the media query for the new DPR
      this.setupDprObserver();
    }
  };

  /**
   * Set up visibility change observer.
   */
  private setupVisibilityObserver(): void {
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private handleVisibilityChange = (): void => {
    if (this._disposed) return;

    const visible = document.visibilityState === "visible";
    if (this._visible !== visible) {
      this._visible = visible;
      this._events.emit("visibilityChange", { visible });
    }
  };

  /**
   * Manually trigger a resize update.
   */
  resize(): void {
    this.updateSize();
  }

  /**
   * Dispose the canvas host and clean up observers.
   */
  dispose(): void {
    if (this._disposed) return;
    this._disposed = true;

    this._resizeObserver?.disconnect();
    this._dprMediaQuery?.removeEventListener("change", this.handleDprChange);
    window.removeEventListener("resize", this.handleWindowResize);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);

    this._events.clear();
  }
}

/**
 * Create a new canvas host.
 */
export function createCanvasHost(config: CanvasHostConfig): CanvasHost {
  return new CanvasHost(config);
}
