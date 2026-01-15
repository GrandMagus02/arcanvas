/**
 * Interface for objects that have configurable options.
 *
 * @template TOptions The type of the options object.
 */
export interface Configurable<TOptions> {
  /**
   * Gets the current options.
   */
  getOptions(): TOptions;

  /**
   * Updates options with partial values.
   * @param options Partial options to merge into current options.
   */
  updateOptions(options: Partial<TOptions>): void;

  /**
   * Sets all options to the provided values.
   * @param options Complete options object.
   */
  setOptions(options: TOptions): void;

  /**
   * Resets options to default values.
   */
  resetOptions(): void;

  /**
   * Current options object.
   */
  options: TOptions;
}

