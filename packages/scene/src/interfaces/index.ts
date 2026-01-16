/**
 * Scene graph interfaces
 */

/**
 * Object with a unique identifier.
 */
export interface Identifiable {
  id: string;
}

/**
 * Object with an optional name.
 */
export interface Named {
  name: string | null;
}

/**
 * Object that can be cloned.
 */
export interface Cloneable<T> {
  clone(deep?: boolean): T;
  deepClone?(): T;
}

/**
 * Object that can be serialized to JSON.
 */
export interface JSONSerializable<T> {
  toJSON(): T;
}

/**
 * Object with a tree structure (parent/children).
 */
export interface TreeLike<T> {
  parent: T | null;
  children: T[];
  add(child: T): this;
  remove(): void;
  removeChild(child: T): void;
}

/**
 * Object that supports tree searching.
 */
export interface Searchable<T> {
  find(predicate: (n: T) => boolean): T | null;
  findAll(predicate: (n: T) => boolean): T[];
  traverse(fn: (n: T) => void): void;
}
