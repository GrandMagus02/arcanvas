/**
 * Interface for builder objects that construct instances of a type.
 *
 * Builders follow the builder pattern, allowing for fluent configuration
 * of complex objects before construction.
 *
 * @template T The type of object that this builder constructs.
 *
 * @example
 * ```ts
 * class MaterialBuilder implements Builder<Material> {
 *   build(): Material {
 *     return new Material(/* ... *\/);
 *   }
 * }
 * ```
 */
export interface Builder<T> {
  /**
   * Builds and returns an instance of the target type.
   *
   * @returns A new instance of type T.
   */
  build(): T;
}
