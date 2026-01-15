import type { Searchable, TreeLike } from "../../infrastructure/interfaces";

/**
 * Base error type for all {@link TreeNode}-related errors.
 */
export class TreeNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TreeNodeError";
  }
}

/**
 * Error thrown when attempting to attach a {@link TreeNode} as a child of itself.
 */
export class TreeNodeSelfAttachmentError extends TreeNodeError {
  constructor() {
    super("Cannot attach a node to itself.");
    this.name = "TreeNodeSelfAttachmentError";
  }
}

/**
 * Error thrown when an operation would introduce a cycle into the TreeNode hierarchy.
 */
export class TreeNodeCycleError extends TreeNodeError {
  constructor() {
    super("Cannot create cycles (child is an ancestor).");
    this.name = "TreeNodeCycleError";
  }
}

/**
 * A generic tree node that provides hierarchical tree structure and operations.
 *
 * @template T The type of the tree node (must extend TreeNode<T> for self-reference).
 */
export abstract class TreeNode<T extends TreeNode<T>> implements TreeLike<T>, Searchable<T> {
  parent: T | null = null;
  children: T[] = [];

  /**
   * Ensures that the given child can be attached to this TreeNode.
   *
   * This check prevents invalid relationships such as attaching a TreeNode to itself
   * or introducing cycles in the hierarchy.
   *
   * @param child The TreeNode that will be attached as a child.
   * @throws TreeNodeSelfAttachmentError If `child` is this TreeNode.
   * @throws TreeNodeCycleError If `child` is an ancestor of this TreeNode (would create a cycle).
   */
  protected ensureCanAttach(child: T): void {
    if (child === (this as unknown as T)) {
      throw new TreeNodeSelfAttachmentError();
    }
    if (child.contains(this as unknown as T)) {
      // If child is an ancestor of this, attaching would create a cycle
      throw new TreeNodeCycleError();
    }
  }

  /**
   * Adds a child TreeNode to this TreeNode, reparenting it if necessary.
   *
   * If the child already has a parent, it will be removed from that parent before
   * being attached here.
   *
   * @param child The TreeNode to add as a child.
   * @returns `this`, for chaining.
   * @throws TreeNodeError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  add(child: T): this {
    this.ensureCanAttach(child);
    // detach from previous parent if any
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this as unknown as T;
    this.children.push(child);
    return this;
  }

  /**
   * Inserts a child at a specific index in the children array.
   *
   * If the child already has a parent, it will be reparented to this node first.
   * The index is clamped to the `[0, children.length]` range.
   *
   * @param child The TreeNode to insert.
   * @param index Target index in the children list (clamped if out of range).
   * @returns `this`, for chaining.
   * @throws TreeNodeError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  addAt(child: T, index: number): this {
    this.ensureCanAttach(child);
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this as unknown as T;
    const i = Math.max(0, Math.min(index, this.children.length));
    this.children.splice(i, 0, child);
    return this;
  }

  /**
   * Detaches this TreeNode from its parent, if it has one.
   *
   * After this call, {@link parent} will be `null`.
   */
  remove(): void {
    if (this.parent) {
      this.parent.removeChild(this as unknown as T);
    }
    this.parent = null;
  }

  /**
   * Removes the given TreeNode from this TreeNode's children.
   *
   * If the TreeNode is not a direct child, this is a no-op.
   *
   * @param child The child TreeNode to remove.
   */
  removeChild(child: T): void {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
  }

  /**
   * Removes all children from this TreeNode.
   *
   * All children's {@link parent} references are cleared.
   */
  removeChildren(): void {
    for (const c of this.children) {
      c.parent = null;
    }
    this.children = [];
  }

  /**
   * Replaces an existing child with a new TreeNode.
   *
   * The new child will be reparented to this TreeNode, and the old child's parent
   * reference will be cleared. If `oldChild` is not a child of this TreeNode, this
   * method does nothing.
   *
   * @param oldChild The existing child to replace.
   * @param newChild The new child TreeNode.
   * @throws TreeNodeError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  replaceChild(oldChild: T, newChild: T): void {
    if (oldChild === newChild) return;
    const idx = this.children.indexOf(oldChild);
    if (idx === -1) return;
    this.ensureCanAttach(newChild);
    if (newChild.parent) {
      newChild.parent.removeChild(newChild);
    }
    oldChild.parent = null;
    newChild.parent = this as unknown as T;
    this.children[idx] = newChild;
  }

  /**
   * Replaces this TreeNode in its parent with another TreeNode.
   *
   * If this TreeNode has no parent, this is a no-op.
   *
   * @param node The TreeNode to insert in place of this TreeNode.
   */
  replaceWith(node: T): void {
    if (!this.parent) return;
    this.parent.replaceChild(this as unknown as T, node);
  }

  /**
   * Moves this TreeNode to a new parent, optionally at a specific index.
   *
   * If the new parent is the same as the current parent and `index` is `undefined`,
   * the operation is a no-op.
   *
   * @param newParent The TreeNode that will become this TreeNode's new parent.
   * @param index Optional index to insert at in the new parent's children list.
   * @throws TreeNodeError If the move would result in an invalid hierarchy.
   */
  moveTo(newParent: T, index?: number): void {
    if (newParent === this.parent && index === undefined) return;
    newParent.ensureCanAttach(this as unknown as T);
    if (this.parent) {
      this.parent.removeChild(this as unknown as T);
    }
    if (index === undefined) {
      newParent.add(this as unknown as T);
    } else {
      newParent.addAt(this as unknown as T, index);
    }
  }

  /**
   * Indicates whether this TreeNode is a root TreeNode (has no parent).
   */
  get isRoot(): boolean {
    return this.parent === null;
  }

  /**
   * Indicates whether this TreeNode is a leaf TreeNode (has no children).
   */
  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * The root TreeNode of the tree that this TreeNode belongs to.
   *
   * If this TreeNode has no parent, it is its own root.
   */
  get root(): T {
    return (this.parent ? this.parent.root : this) as T;
  }

  /**
   * The depth of this TreeNode in the tree.
   *
   * Roots have depth `0`; direct children of the root have depth `1`, and so on.
   */
  get depth(): number {
    let d = 0;
    let n: T | null = this.parent;
    while (n) {
      d++;
      n = n.parent;
    }
    return d;
  }

  /**
   * The level of this TreeNode in the tree.
   *
   * Leaf TreeNodes have level `0`. A TreeNode with children has a level of
   * `1 + max(child.level)`.
   */
  get level(): number {
    if (this.children.length === 0) return 0;
    let max = 0;
    for (const c of this.children) {
      const h = c.level + 1;
      if (h > max) max = h;
    }
    return max;
  }

  /**
   * Counts the number of TreeNodes in the subtree rooted at this TreeNode.
   *
   * @returns The total number of TreeNodes including this TreeNode.
   */
  size(): number {
    let count = 1;
    const children = this.children;
    for (const c of children) count += c.size();
    return count;
  }

  /**
   * Returns this TreeNode's index in its parent's children array.
   *
   * @returns The zero-based index, or `-1` if this TreeNode has no parent.
   */
  index(): number {
    const parent = this.parent;
    if (!parent) return -1;
    return parent.children.indexOf(this as unknown as T);
  }

  /**
   * Returns the siblings of this TreeNode (other children of the same parent).
   *
   * @returns An array of sibling TreeNodes, or an empty array if this is a root.
   */
  siblings(): T[] {
    const parent = this.parent;
    if (!parent) return [];
    const siblings = parent.children;
    return siblings.filter((c) => c !== (this as unknown as T));
  }

  /**
   * Returns the previous sibling of this TreeNode, if any.
   *
   * @returns The previous sibling, or `null` if this TreeNode is the first child or a root.
   */
  prevSibling(): T | null {
    const parent = this.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(this as unknown as T);
    if (idx <= 0) return null;
    const prev = siblings[idx - 1];
    return prev ?? null;
  }

  /**
   * Returns the next sibling of this TreeNode, if any.
   *
   * @returns The next sibling, or `null` if this TreeNode is the last child or a root.
   */
  nextSibling(): T | null {
    const parent = this.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(this as unknown as T);
    if (idx < 0 || idx >= siblings.length - 1) return null;
    const next = siblings[idx + 1];
    return next ?? null;
  }

  /**
   * Returns all ancestors of this TreeNode, starting from its parent up to the root.
   *
   * @returns An array of ancestor TreeNodes in order from closest parent to root.
   */
  ancestors(): T[] {
    const list: T[] = [];
    let n: T | null = this.parent;
    while (n) {
      list.push(n);
      n = n.parent;
    }
    return list;
  }

  /**
   * Returns all descendants of this TreeNode (children, grandchildren, etc.).
   *
   * @returns A flat array of all descendant TreeNodes.
   */
  descendants(): T[] {
    const out: T[] = [];
    for (const c of this.children) {
      out.push(c, ...c.descendants());
    }
    return out;
  }

  /**
   * Returns the path from the root TreeNode down to this TreeNode (inclusive).
   *
   * @returns An array of TreeNodes starting with the root and ending with this TreeNode.
   */
  pathFromRoot(): T[] {
    return [...this.ancestors()].reverse().concat(this as unknown as T);
  }

  /**
   * Determines whether this TreeNode is an ancestor of another TreeNode.
   *
   * @param other The TreeNode to test against.
   * @returns `true` if this TreeNode is an ancestor of `other`, otherwise `false`.
   */
  isAncestorOf(other: T): boolean {
    let n: T | null = other.parent;
    while (n) {
      if (n === (this as unknown as T)) return true;
      n = n.parent;
    }
    return false;
  }

  /**
   * Determines whether this TreeNode is a descendant of another TreeNode.
   *
   * @param other The node to test against.
   * @returns `true` if this TreeNode is a descendant of `other`, otherwise `false`.
   */
  isDescendantOf(other: T): boolean {
    return other.isAncestorOf(this as unknown as T);
  }

  /**
   * Determines whether this node's subtree contains another node.
   *
   * @param node The TreeNode to look for.
   * @returns `true` if `node` is this node or one of its descendants.
   */
  contains(node: T): boolean {
    return node === (this as unknown as T) || this.isAncestorOf(node);
  }

  /**
   * Traverses the subtree rooted at this TreeNode in depth-first order.
   *
   * @param fn Callback invoked for each visited TreeNode.
   */
  traverse(fn: (n: T) => void): void {
    fn(this as unknown as T);
    for (const c of this.children) c.traverse(fn);
  }

  /**
   * Traverses the subtree rooted at this TreeNode in breadth-first order.
   *
   * @param fn Callback invoked for each visited TreeNode.
   */
  traverseBF(fn: (n: T) => void): void {
    const q: T[] = [this as unknown as T];
    for (let i = 0; i < q.length; i++) {
      const n = q[i]!;
      fn(n);
      const children = n.children;
      if (children.length) {
        q.push(...children);
      }
    }
  }

  /**
   * Finds the first TreeNode in this subtree that matches the given predicate.
   *
   * @param predicate Function used to test each TreeNode.
   * @returns The first matching TreeNode, or `null` if none match.
   */
  find(predicate: (n: T) => boolean): T | null {
    if (predicate(this as unknown as T)) return this as unknown as T;
    for (const c of this.children) {
      const found = c.find(predicate);
      if (found) return found;
    }
    return null;
  }

  /**
   * Finds all TreeNodes in this subtree that match the given predicate.
   *
   * @param predicate Function used to test each TreeNode.
   * @returns An array of all matching TreeNodes (possibly empty).
   */
  findAll(predicate: (n: T) => boolean): T[] {
    const out: T[] = [];
    this.traverse((n) => {
      if (predicate(n)) out.push(n);
    });
    return out;
  }
}
