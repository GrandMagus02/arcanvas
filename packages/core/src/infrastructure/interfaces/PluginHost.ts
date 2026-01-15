/**
 * Interface for objects that can host plugins.
 *
 * @template TSelf The type of the implementing class (for method chaining).
 */
export interface PluginHost<TSelf = unknown> {
  /**
   * Registers a plugin with optional options.
   * @param plugin The plugin to register.
   * @param opts Optional configuration for the plugin.
   * @returns The host instance for method chaining.
   */
  use<T = unknown>(plugin: unknown, opts?: T): TSelf;

  /**
   * Checks if a plugin is registered.
   * @param plugin The plugin to check.
   * @returns `true` if the plugin is registered, `false` otherwise.
   */
  has(plugin: unknown): boolean;

  /**
   * Gets the instance of a registered plugin.
   * @param plugin The plugin to get.
   * @returns The plugin instance, or `undefined` if not registered.
   */
  get<T = unknown>(plugin: unknown): T | undefined;
}

