/**
 * Interface for objects that form a hierarchical tree structure.
 *
 * @template T The type of the tree node (typically the implementing class).
 */
export interface TreeLike<T> {
  /**
   * Reference to the parent node, or `null` if this is a root node.
   */
  parent: T | null;

  /**
   * Array of child nodes.
   */
  children: T[];

  /**
   * Indicates whether this node is a root (has no parent).
   */
  readonly isRoot: boolean;

  /**
   * Indicates whether this node is a leaf (has no children).
   */
  readonly isLeaf: boolean;

  /**
   * The root node of the tree that this node belongs to.
   */
  readonly root: T;

  /**
   * The depth of this node in the tree (distance from root).
   * Roots have depth `0`.
   */
  readonly depth: number;

  /**
   * The level (height) of the subtree rooted at this node.
   * Leaf nodes have level `0`.
   */
  readonly level: number;
}
