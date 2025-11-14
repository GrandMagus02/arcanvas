/**
 * A manager for a collection of items.
 */
export abstract class AbstractManager<T, K extends string = string> {
  protected _items: Map<K, T> = new Map();

  add(id: K, item: T): void {
    this._items.set(id, item);
  }

  remove(id: K): void {
    this._items.delete(id);
  }

  get(id: K): T | undefined {
    return this._items.get(id);
  }

  has(id: K): boolean {
    return this._items.has(id);
  }

  clear(): void {
    this._items.clear();
  }
}
