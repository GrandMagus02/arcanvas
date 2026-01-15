import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";

/**
 * Base class for all plugins.
 */
export abstract class Plugin<T = unknown> {
  private _app: IArcanvasContext;
  private _opts: T;

  constructor(app: IArcanvasContext, opts: T) {
    this._app = app;
    this._opts = opts;
  }

  get app(): IArcanvasContext {
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
export type PluginLike<T = unknown> = new (app: IArcanvasContext, opts: T) => Plugin<T>;
