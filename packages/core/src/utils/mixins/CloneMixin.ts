import type { Cloneable } from "../interfaces/Cloneable";

/**
 * Mixin class that provides clone and deepClone functionality for tree-like structures.
 *
 * Classes using this mixin must:
 * 1. Have a `children` property (array of the same type)
 * 2. Have an `add` method to add children
 * 3. Implement `createCloneInstance()` method that creates a new instance without children
 *
 * @template T The type of the object being cloned (must extend the class using this mixin).
 */
export abstract class CloneMixin<T extends CloneMixin<T>> implements Cloneable<T> {
  /**
   * Creates a new instance of this class for cloning purposes.
   * Must be implemented by classes using this mixin.
   *
   * @returns A new instance without children.
   */
  protected abstract createCloneInstance(): T;

  /**
   * Creates a copy of this object.
   *
   * @param deep When `true`, all descendants are also cloned recursively.
   *             When `false`, the clone has no children.
   * @returns A cloned instance.
   */
  clone(deep: boolean = true): T {
    const copy = this.createCloneInstance();
    if (deep && "children" in this && Array.isArray((this as unknown as { children: T[] }).children)) {
      const children = (this as unknown as { children: T[] }).children;
      for (const child of children) {
        if ("clone" in child && typeof child.clone === "function") {
          const childClone = child.clone(true);
          if ("add" in copy && typeof copy.add === "function") {
            (copy as unknown as { add: (child: T) => void }).add(childClone);
          }
        }
      }
    }
    return copy;
  }

  /**
   * Creates a deep clone of this object and all its descendants.
   *
   * @returns A deep cloned instance.
   */
  deepClone(): T {
    return this.clone(true);
  }
}
