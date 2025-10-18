import { EventBus, type HookFn } from "./EventBus";
import { Renderer, type RendererOptions } from "./Renderer";

/**
 * Options for configuring an `Arcanvas` instance.
 */
export interface ArcanvasOptions {
  width: number;
  height: number;
  renderer?: boolean | RendererOptions;
  [key: string]: unknown;
}

// New plugin system types (2D lifecycle-driven plugins)
/** Public surface returned by plugins and mounted on the app under its name. */
export type PluginAPI = unknown;

/** Declarative plugin with optional dependencies and setup lifecycle. */
export type Plugin<Name extends string, API, Opts = unknown> = {
  name: Name;
  deps?: string[];
  setup(ctx: PluginContext, opts: Opts): API | { api: API; dispose?: () => void };
};

/** Context object exposed to plugins during setup and via hooks. */
export type PluginContext = {
  app: Arcanvas;
  canvas: HTMLCanvasElement;
  ctx2d: CanvasRenderingContext2D | null;
  events: EventBus;
  get<T = unknown>(name: string): T | undefined;
  has(name: string): boolean;
  hooks: {
    onInit(fn: () => void): void;
    onUpdate(fn: (dt: number) => void): void;
    onRender(fn: (ctx: CanvasRenderingContext2D) => void): void;
    onResize(fn: (w: number, h: number) => void): void;
    onDestroy(fn: () => void): void;
  };
};

type AnyPlugin = Plugin<string, unknown, unknown>;

/** Internal lifecycle hooks storage. */
type Hooks = {
  init: HookFn[];
  update: ((dt: number) => void)[];
  render: ((ctx: CanvasRenderingContext2D) => void)[];
  resize: ((w: number, h: number) => void)[];
  destroy: HookFn[];
};

/**
 * Type guard to detect an object-style plugin definition.
 */
function isObjectPlugin(candidate: unknown): candidate is AnyPlugin {
  if (!candidate || typeof candidate !== "object") return false;
  const rec = candidate as { name?: unknown; setup?: unknown };
  return typeof rec.name === "string" && typeof rec.setup === "function";
}

/**
 * Detects the structured return value containing an api and optional disposer.
 */
function isResultWithApi(x: unknown): x is { api: unknown; dispose?: () => void } {
  return !!x && typeof x === "object" && "api" in (x as Record<string, unknown>);
}

/**
 * Default `Arcanvas` options.
 */
export const DEFAULT_ARCANVAS_OPTIONS: ArcanvasOptions = Object.freeze({
  width: 100,
  height: 100,
});

/**
 * Arcanvas is a class that provides a canvas for rendering.
 */
export class Arcanvas {
  private _canvas: HTMLCanvasElement;
  private _options: ArcanvasOptions = Object.assign({}, DEFAULT_ARCANVAS_OPTIONS);
  public readonly plugin: Record<string, unknown> = {};

  // New system: events + plugin APIs map
  public readonly events = new EventBus();
  public readonly plugins = new Map<string, PluginAPI>();
  public readonly ctx2d: CanvasRenderingContext2D | null;
  public renderer: Renderer | null = null;

  private hooks: Hooks = { init: [], update: [], render: [], resize: [], destroy: [] };
  private disposers = new Map<string, () => void>();
  private rafId: number | null = null;
  private lastTs = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement, options: Partial<ArcanvasOptions> = {}) {
    this._canvas = canvas;
    this.updateOptions(options);
    this.applySizeFromOptions();

    this.ctx2d = canvas.getContext("2d");

    // Optional WebGL renderer
    if (options.renderer) {
      const rOpts = typeof options.renderer === "object" ? options.renderer : undefined;
      this.renderer = new Renderer(canvas, rOpts);
    }

    const resizeObserver = new ResizeObserver(() => {
      const rect = this._canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this._canvas.width = Math.max(1, Math.round(rect.width * dpr));
      this._canvas.height = Math.max(1, Math.round(rect.height * dpr));
      this.ctx2d?.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const fn of this.hooks.resize) fn(this._canvas.width, this._canvas.height);
    });
    resizeObserver.observe(this._canvas);
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  set canvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  get options(): ArcanvasOptions {
    return this._options;
  }

  set options(options: ArcanvasOptions) {
    this._options = options;
  }

  getOptions(): ArcanvasOptions {
    return this.options;
  }

  updateOptions(options: Partial<ArcanvasOptions>) {
    Object.assign(this.options, options);
  }

  setOptions(options: ArcanvasOptions) {
    Object.assign(this.options, options);
  }

  resetOptions() {
    Object.assign(this.options, DEFAULT_ARCANVAS_OPTIONS);
  }

  private applySizeFromOptions() {
    const { width, height } = this._options;
    if (typeof width === "number") {
      this._canvas.width = width;
    }
    if (typeof height === "number") {
      this._canvas.height = height;
    }
  }

  // New style: object plugins with name/setup/deps only
  use<Name extends string, API, Opts = unknown>(
    plugin: Plugin<Name, API, Opts>,
    opts?: Opts
  ): Arcanvas & Record<Name, API>;
  // Base overload for already-typed plugin containers
  use(plugin: AnyPlugin, opts?: unknown): Arcanvas;
  use(plugin: unknown, opts?: unknown): unknown {
    // Object plugin path
    if (isObjectPlugin(plugin)) {
      const p = plugin;
      for (const dep of p.deps ?? []) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin '${p.name}' requires '${dep}' to be installed first.`);
        }
      }
      const ctx = this.makeCtx();
      const res: unknown = p.setup(ctx, opts as never);
      let api: unknown;
      let dispose: (() => void) | undefined;
      if (isResultWithApi(res)) {
        api = res.api;
        dispose = res.dispose;
      } else {
        api = res;
      }
      // The plugin API surface can be any serializable object/function bag
      this.decorate(p.name, api);
      if (dispose) this.disposers.set(p.name, dispose);
      return this;
    }
    throw new Error("Invalid plugin: expected object-style plugin with name/setup.");
  }

  destroy() {
    this.stop();
    for (const fn of this.hooks.destroy) fn();
    for (const [, dispose] of this.disposers) dispose();
    this.disposers.clear();
    this.plugins.clear();
  }

  // New system helpers
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  get<T = unknown>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined;
  }

  start() {
    if (this.running) return;
    // Start WebGL renderer if present
    this.renderer?.start();
    if (!this.ctx2d) return; // 2D loop only when 2D context is available
    this.running = true;
    for (const fn of this.hooks.init) fn();
    const loop = (ts: number) => {
      if (!this.running) return;
      const dt = Math.min(32, ts - (this.lastTs || ts));
      this.lastTs = ts;
      for (const fn of this.hooks.update) fn(dt);
      const g = this.ctx2d!;
      g.clearRect(0, 0, this._canvas.width, this._canvas.height);
      for (const fn of this.hooks.render) fn(g);
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.renderer?.stop();
  }

  private decorate<Name extends string, API>(
    name: Name,
    api: API
  ): asserts this is Arcanvas & Record<Name, API> {
    if (this.plugins.has(name)) throw new Error(`Plugin '${name}' is already installed.`);
    Object.defineProperty(this, name, {
      value: api,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    this.plugins.set(name, api as PluginAPI);
  }

  private makeCtx(): PluginContext {
    return {
      app: this,
      canvas: this._canvas,
      ctx2d: this.ctx2d,
      events: this.events,
      get: <T = unknown>(name: string) => this.get<T>(name),
      has: (name: string) => this.has(name),
      hooks: {
        onInit: (fn) => this.hooks.init.push(fn),
        onUpdate: (fn) => this.hooks.update.push(fn),
        onRender: (fn) => this.hooks.render.push(fn),
        onResize: (fn) => this.hooks.resize.push(fn),
        onDestroy: (fn) => this.hooks.destroy.push(fn),
      },
    };
  }
}
