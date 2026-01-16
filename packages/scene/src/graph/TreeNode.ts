import type { TreeLike, Searchable } from "../interfaces";

/**
 * Base error type for all TreeNode-related errors.
 */
export class TreeNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TreeNodeError";
  }
}

/**
 * Error thrown when attempting to attach a TreeNode as a child of itself.
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
   */
  protected ensureCanAttach(child: T): void {
    if (child === (this as unknown as T)) {
      throw new TreeNodeSelfAttachmentError();
    }
    if (child.contains(this as unknown as T)) {
      throw new TreeNodeCycleError();
    }
  }

  /**
   * Adds a child TreeNode to this TreeNode.
   */
  add(child: T): this {
    this.ensureCanAttach(child);
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this as unknown as T;
    this.children.push(child);
    return this;
  }

  /**
   * Inserts a child at a specific index.
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
   * Detaches this TreeNode from its parent.
   */
  remove(): void {
    if (this.parent) {
      this.parent.removeChild(this as unknown as T);
    }
    this.parent = null;
  }

  /**
   * Removes the given TreeNode from this TreeNode's children.
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
   */
  removeChildren(): void {
    for (const c of this.children) {
      c.parent = null;
    }
    this.children = [];
  }

  /**
   * Replaces an existing child with a new TreeNode.
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
   */
  replaceWith(node: T): void {
    if (!this.parent) return;
    this.parent.replaceChild(this as unknown as T, node);
  }

  /**
   * Moves this TreeNode to a new parent.
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

  get isRoot(): boolean {
    return this.parent === null;
  }

  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  get root(): T {
    return (this.parent ? this.parent.root : this) as T;
  }

  get depth(): number {
    let d = 0;
    let n: T | null = this.parent;
    while (n) {
      d++;
      n = n.parent;
    }
    return d;
  }

  get level(): number {
    if (this.children.length === 0) return 0;
    let max = 0;
    for (const c of this.children) {
      const h = c.level + 1;
      if (h > max) max = h;
    }
    return max;
  }

  size(): number {
    let count = 1;
    for (const c of this.children) count += c.size();
    return count;
  }

  index(): number {
    if (!this.parent) return -1;
    return this.parent.children.indexOf(this as unknown as T);
  }

  siblings(): T[] {
    if (!this.parent) return [];
    return this.parent.children.filter((c) => c !== (this as unknown as T));
  }

  prevSibling(): T | null {
    if (!this.parent) return null;
    const idx = this.parent.children.indexOf(this as unknown as T);
    if (idx <= 0) return null;
    return this.parent.children[idx - 1] ?? null;
  }

  nextSibling(): T | null {
    if (!this.parent) return null;
    const idx = this.parent.children.indexOf(this as unknown as T);
    if (idx < 0 || idx >= this.parent.children.length - 1) return null;
    return this.parent.children[idx + 1] ?? null;
  }

  ancestors(): T[] {
    const list: T[] = [];
    let n: T | null = this.parent;
    while (n) {
      list.push(n);
      n = n.parent;
    }
    return list;
  }

  descendants(): T[] {
    const out: T[] = [];
    for (const c of this.children) {
      out.push(c, ...c.descendants());
    }
    return out;
  }

  pathFromRoot(): T[] {
    return [...this.ancestors()].reverse().concat(this as unknown as T);
  }

  isAncestorOf(other: T): boolean {
    let n: T | null = other.parent;
    while (n) {
      if (n === (this as unknown as T)) return true;
      n = n.parent;
    }
    return false;
  }

  isDescendantOf(other: T): boolean {
    return other.isAncestorOf(this as unknown as T);
  }

  contains(node: T): boolean {
    return node === (this as unknown as T) || this.isAncestorOf(node);
  }

  traverse(fn: (n: T) => void): void {
    fn(this as unknown as T);
    for (const c of this.children) c.traverse(fn);
  }

  traverseBF(fn: (n: T) => void): void {
    const q: T[] = [this as unknown as T];
    for (let i = 0; i < q.length; i++) {
      const n = q[i]!;
      fn(n);
      if (n.children.length) {
        q.push(...n.children);
      }
    }
  }

  find(predicate: (n: T) => boolean): T | null {
    if (predicate(this as unknown as T)) return this as unknown as T;
    for (const c of this.children) {
      const found = c.find(predicate);
      if (found) return found;
    }
    return null;
  }

  findAll(predicate: (n: T) => boolean): T[] {
    const out: T[] = [];
    this.traverse((n) => {
      if (predicate(n)) out.push(n);
    });
    return out;
  }
}
