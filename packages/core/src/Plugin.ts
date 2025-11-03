import type { Arcanvas } from "./Arcanvas";

/**
 * Base class for all plugins.
 */
export abstract class Plugin<T = unknown> {
  private _app: Arcanvas;
  private _opts: T;

  constructor(app: Arcanvas, opts: T) {
    this._app = app;
    this._opts = opts;
  }

  get app(): Arcanvas {
    return this._app;
  }

  get opts(): T {
    return this._opts;
  }

  abstract setup(): void;
  abstract destroy(): void;
}

/**
 * A type that represents a plugin.
 */
export type PluginLike<T = unknown> = new (app: Arcanvas, opts: T) => Plugin<T>;
