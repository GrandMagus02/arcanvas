/**
 * Interface for objects that can be cloned.
 *
 * @template T The type of the object being cloned.
 */
export interface Cloneable<T> {
  /**
   * Creates a copy of this object.
   *
   * @param deep When `true`, all descendants are also cloned recursively.
   *             When `false`, the clone has no children.
   * @returns A cloned instance.
   */
  clone(deep?: boolean): T;

  /**
   * Creates a deep clone of this object and all its descendants.
   *
   * @returns A deep cloned instance.
   */
  deepClone(): T;
}

