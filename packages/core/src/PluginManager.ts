import type { Arcanvas } from "./Arcanvas";
import type { Plugin, PluginLike } from "./Plugin";

/**
 * The plugin manager.
 */
export class PluginManager {
  private _plugins = new Map<PluginLike, Plugin>();
  private _app: Arcanvas;

  constructor(app: Arcanvas) {
    this._app = app;
  }

  has<T = unknown>(plugin: PluginLike<T>): boolean {
    return this._plugins.has(plugin as PluginLike);
  }

  get<T = unknown>(plugin: PluginLike<T>): T | undefined {
    return this._plugins.get(plugin as PluginLike) as T | undefined;
  }

  use<T = unknown>(plugin: PluginLike<T>, opts: T): void {
    const pl = new plugin(this._app, opts);
    this._plugins.set(plugin as PluginLike, pl);
    pl.setup();
  }

  destroy<T = unknown>(plugin: PluginLike<T>): void {
    const pl = this._plugins.get(plugin as PluginLike);
    if (pl) pl.destroy();
    this._plugins.delete(plugin as PluginLike);
  }

  setupAll(): void {
    for (const [, pl] of this._plugins) pl.setup();
  }

  destroyAll(): void {
    for (const [, pl] of this._plugins) pl.destroy();
    this._plugins.clear();
  }
}
