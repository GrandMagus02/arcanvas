import type { Plugin, PluginLike } from "../plugins/Plugin";
import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";

/**
 * Manages plugin lifecycle and registration.
 * Replaces PluginManager with better separation of concerns.
 *
 * @template Host The type of the host object that plugins will be attached to (must implement IArcanvasContext).
 */
export class PluginSystem<Host extends IArcanvasContext> {
  private _plugins = new Map<PluginLike<unknown>, Plugin<unknown>>();
  private _host: Host;

  constructor(host: Host) {
    this._host = host;
  }

  use<T = unknown>(plugin: PluginLike<T>, opts?: T): Host {
    const pl = new plugin(this._host, opts as T);
    this._plugins.set(plugin as PluginLike<unknown>, pl as Plugin<unknown>);
    pl.setup();
    return this._host;
  }

  has(plugin: PluginLike): boolean {
    return this._plugins.has(plugin as PluginLike<unknown>);
  }

  get<T = unknown>(plugin: PluginLike<T>): T | undefined {
    return this._plugins.get(plugin as PluginLike<unknown>) as T | undefined;
  }

  destroy<T = unknown>(plugin: PluginLike<T>): void {
    const pl = this._plugins.get(plugin as PluginLike<unknown>);
    if (pl) pl.destroy();
    this._plugins.delete(plugin as PluginLike<unknown>);
  }

  setupAll(): void {
    for (const [, pl] of this._plugins) pl.setup();
  }

  destroyAll(): void {
    for (const [, pl] of this._plugins) pl.destroy();
    this._plugins.clear();
  }
}
