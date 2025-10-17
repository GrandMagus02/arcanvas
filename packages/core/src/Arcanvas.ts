/**
 * Options for configuring an `Arcanvas` instance.
 */
export interface ArcanvasPluginInstance {
  destroy?: () => void;
}

export type ArcanvasPluginCtor<
  TOptions = any,
  TInstance extends ArcanvasPluginInstance = ArcanvasPluginInstance,
> = new (arcanvas: Arcanvas, options?: TOptions) => TInstance;

export type ArcanvasPluginFactory = (arcanvas: Arcanvas) => ArcanvasPluginInstance | void;

export type ArcanvasPluginDescriptor<TOptions = any> = {
  plugin: ArcanvasPluginCtor<TOptions>;
  options?: TOptions;
};

export interface ArcanvasOptions {
  width: number;
  height: number;
  plugins?: Array<ArcanvasPluginDescriptor<any> | ArcanvasPluginFactory>;
  [key: string]: unknown;
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
  private _pluginInstances: ArcanvasPluginInstance[] = [];
  private _di = new Map<unknown, unknown>();

  constructor(canvas: HTMLCanvasElement, options: Partial<ArcanvasOptions> = {}) {
    this._canvas = canvas;
    this.updateOptions(options);
    this.applySizeFromOptions();
    this.initPlugins(this._options.plugins);
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

  private initPlugins(plugins?: Array<ArcanvasPluginDescriptor<any> | ArcanvasPluginFactory>) {
    if (!plugins || plugins.length === 0) return;
    for (const entry of plugins) {
      let instance: ArcanvasPluginInstance | void = undefined;
      if (typeof entry === "function") {
        instance = entry(this);
      } else if (entry && typeof (entry as any).plugin === "function") {
        const { plugin, options } = entry as ArcanvasPluginDescriptor<any>;
        instance = new plugin(this, options);
      }
      if (instance) {
        this._pluginInstances.push(instance);
      }
    }
  }

  use<TOptions, TInstance extends ArcanvasPluginInstance = ArcanvasPluginInstance>(
    plugin: ArcanvasPluginCtor<TOptions, TInstance>,
    options?: TOptions
  ): TInstance {
    const instance = new plugin(this, options);
    this._pluginInstances.push(instance);
    return instance;
  }

  destroy() {
    for (let i = this._pluginInstances.length - 1; i >= 0; i -= 1) {
      try {
        this._pluginInstances[i]?.destroy?.();
      } catch {}
    }
    this._pluginInstances = [];
  }

  /**
   * Provide a value in the Arcanvas dependency container.
   */
  provide<T>(token: unknown, value: T): void {
    this._di.set(token, value);
  }

  /**
   * Inject a value from the Arcanvas dependency container.
   */
  inject<T>(token: unknown): T | undefined {
    return this._di.get(token) as T | undefined;
  }
}
