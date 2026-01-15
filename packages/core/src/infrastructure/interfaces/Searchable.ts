/**
 * Interface for tree structures that support searching operations.
 *
 * @template T The type of the tree node (typically the implementing class).
 */
export interface Searchable<T> {
  /**
   * Finds the first node in this subtree that matches the given predicate.
   *
   * @param predicate Function used to test each node.
   * @returns The first matching node, or `null` if none match.
   */
  find(predicate: (node: T) => boolean): T | null;

  /**
   * Finds all nodes in this subtree that match the given predicate.
   *
   * @param predicate Function used to test each node.
   * @returns An array of all matching nodes (possibly empty).
   */
  findAll(predicate: (node: T) => boolean): T[];
}

