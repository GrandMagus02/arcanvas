import { uuid } from "../utils/uuid";

/**
 * JSON representation of a Node.
 */
export interface NodeJSON {
  id: string;
  name?: string | undefined;
  parent?: string | undefined;
  children?: NodeJSON[] | undefined;
}

/**
 * Base error type for all {@link Node}-related errors.
 */
export class NodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NodeError";
  }
}

/**
 * Error thrown when attempting to attach a {@link Node} as a child of itself.
 */
export class NodeSelfAttachmentError extends NodeError {
  constructor() {
    super("Cannot attach a node to itself.");
    this.name = "NodeSelfAttachmentError";
  }
}

/**
 * Error thrown when an operation would introduce a cycle into the node hierarchy.
 */
export class NodeCycleError extends NodeError {
  constructor() {
    super("Cannot create cycles (child is an ancestor).");
    this.name = "NodeCycleError";
  }
}

/**
 * A node in the scene graph.
 */
export class Node {
  id: string;
  name: string | null = null;
  parent: Node | null = null;
  children: Node[] = [];

  /**
   * Creates a new {@link Node}.
   *
   * @param name Optional name for the node. Defaults to `null`.
   * @param id Optional id. If omitted, a new UUID will be generated.
   */
  constructor(name: string | null = null, id: string = uuid()) {
    this.id = id;
    this.name = name;
  }

  /**
   * Ensures that the given child can be attached to this node.
   *
   * This check prevents invalid relationships such as attaching a node to itself
   * or introducing cycles in the hierarchy.
   *
   * @param child The node that will be attached as a child.
   * @throws NodeSelfAttachmentError If `child` is this node.
   * @throws NodeCycleError If `child` is an ancestor of this node (would create a cycle).
   */
  private ensureCanAttach(child: Node): void {
    if (child === this) {
      throw new NodeSelfAttachmentError();
    }
    if (child.contains(this)) {
      // If child is an ancestor of this, attaching would create a cycle
      throw new NodeCycleError();
    }
  }

  /**
   * Creates a copy of this node.
   *
   * @param deep When `true`, all descendants are also cloned recursively.
   *             When `false`, the clone has no children.
   * @returns A cloned {@link Node} instance.
   */
  clone(deep: boolean = true): Node {
    const copy = new Node(this.name);
    if (deep) {
      for (const child of this.children) {
        const childClone = child.clone(true);
        copy.add(childClone);
      }
    }
    return copy;
  }

  /**
   * Convenience alias for {@link Node.clone} with `deep` set to `true`.
   *
   * @returns A deep clone of this node and its descendants.
   */
  deepClone(): Node {
    return this.clone(true);
  }

  /**
   * Serializes this node (and its children) into a JSON-friendly structure.
   *
   * @returns A {@link NodeJSON} object describing this subtree.
   */
  toJSON(): NodeJSON {
    return {
      id: this.id,
      name: this.name ?? undefined,
      parent: this.parent?.id,
      children: this.children.map((c) => c.toJSON()),
    };
  }

  /**
   * Reconstructs a node (and its subtree) from its JSON representation.
   *
   * @param json The serialized {@link NodeJSON} structure.
   * @returns The root {@link Node} of the reconstructed subtree.
   */
  static fromJSON(json: NodeJSON): Node {
    const node = new Node(json.name, json.id);
    for (const cj of json.children ?? []) {
      node.add(Node.fromJSON(cj));
    }
    return node;
  }

  /**
   * Adds a child node to this node, reparenting it if necessary.
   *
   * If the child already has a parent, it will be removed from that parent before
   * being attached here.
   *
   * @param child The node to add as a child.
   * @returns `this`, for chaining.
   * @throws NodeError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  add(child: Node): this {
    this.ensureCanAttach(child);
    // detach from previous parent if any
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
    return this;
  }

  /**
   * Inserts a child at a specific index in the children array.
   *
   * If the child already has a parent, it will be reparented to this node first.
   * The index is clamped to the `[0, children.length]` range.
   *
   * @param child The node to insert.
   * @param index Target index in the children list (clamped if out of range).
   * @returns `this`, for chaining.
   * @throws NodeError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  addAt(child: Node, index: number): this {
    this.ensureCanAttach(child);
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    const i = Math.max(0, Math.min(index, this.children.length));
    this.children.splice(i, 0, child);
    return this;
  }

  /**
   * Detaches this node from its parent, if it has one.
   *
   * After this call, {@link parent} will be `null`.
   */
  remove(): void {
    if (this.parent) {
      this.parent.removeChild(this);
    }
    this.parent = null;
  }

  /**
   * Removes the given node from this node's children.
   *
   * If the node is not a direct child, this is a no-op.
   *
   * @param child The child node to remove.
   */
  removeChild(child: Node): void {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
  }

  /**
   * Removes all children from this node.
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
   * Replaces an existing child with a new node.
   *
   * The new child will be reparented to this node, and the old child's parent
   * reference will be cleared. If `oldChild` is not a child of this node, this
   * method does nothing.
   *
   * @param oldChild The existing child to replace.
   * @param newChild The new child node.
   * @throws NodeError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  replaceChild(oldChild: Node, newChild: Node): void {
    if (oldChild === newChild) return;
    const idx = this.children.indexOf(oldChild);
    if (idx === -1) return;
    this.ensureCanAttach(newChild);
    if (newChild.parent) {
      newChild.parent.removeChild(newChild);
    }
    oldChild.parent = null;
    newChild.parent = this;
    this.children[idx] = newChild;
  }

  /**
   * Replaces this node in its parent with another node.
   *
   * If this node has no parent, this is a no-op.
   *
   * @param node The node to insert in place of this node.
   */
  replaceWith(node: Node): void {
    if (!this.parent) return;
    this.parent.replaceChild(this, node);
  }

  /**
   * Moves this node to a new parent, optionally at a specific index.
   *
   * If the new parent is the same as the current parent and `index` is `undefined`,
   * the operation is a no-op.
   *
   * @param newParent The node that will become this node's new parent.
   * @param index Optional index to insert at in the new parent's children list.
   * @throws NodeError If the move would result in an invalid hierarchy.
   */
  moveTo(newParent: Node, index?: number): void {
    if (newParent === this.parent && index === undefined) return;
    newParent.ensureCanAttach(this);
    if (this.parent) {
      this.parent.removeChild(this);
    }
    if (index === undefined) {
      newParent.add(this);
    } else {
      newParent.addAt(this, index);
    }
  }

  /**
   * Indicates whether this node is a root node (has no parent).
   */
  get isRoot(): boolean {
    return this.parent === null;
  }

  /**
   * Indicates whether this node is a leaf node (has no children).
   */
  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * The root node of the tree that this node belongs to.
   *
   * If this node has no parent, it is its own root.
   */
  get root(): Node {
    return this.parent ? this.parent.root : this;
  }

  /**
   * The depth of this node in the tree.
   *
   * Roots have depth `0`; direct children of the root have depth `1`, and so on.
   */
  get depth(): number {
    let d = 0;
    let n: Node | null = this.parent;
    while (n) {
      d++;
      n = n.parent;
    }
    return d;
  }

  /**
   * The height of this node in the tree.
   *
   * Leaf nodes have height `0`. A node with children has a height of
   * `1 + max(child.height)`.
   */
  get height(): number {
    if (this.children.length === 0) return 0;
    let max = 0;
    for (const c of this.children) {
      const h = c.height + 1;
      if (h > max) max = h;
    }
    return max;
  }

  /**
   * Counts the number of nodes in the subtree rooted at this node.
   *
   * @returns The total number of nodes including this node.
   */
  size(): number {
    let count = 1;
    const children = this.children;
    for (const c of children) count += c.size();
    return count;
  }

  /**
   * Returns this node's index in its parent's children array.
   *
   * @returns The zero-based index, or `-1` if this node has no parent.
   */
  index(): number {
    const parent = this.parent;
    if (!parent) return -1;
    return parent.children.indexOf(this);
  }

  /**
   * Returns the siblings of this node (other children of the same parent).
   *
   * @returns An array of sibling nodes, or an empty array if this is a root.
   */
  siblings(): Node[] {
    const parent = this.parent;
    if (!parent) return [];
    const siblings = parent.children;
    return siblings.filter((c) => c !== this);
  }

  /**
   * Returns the previous sibling of this node, if any.
   *
   * @returns The previous sibling, or `null` if this node is the first child or a root.
   */
  prevSibling(): Node | null {
    const parent = this.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(this);
    if (idx <= 0) return null;
    const prev = siblings[idx - 1];
    return prev ?? null;
  }

  /**
   * Returns the next sibling of this node, if any.
   *
   * @returns The next sibling, or `null` if this node is the last child or a root.
   */
  nextSibling(): Node | null {
    const parent = this.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(this);
    if (idx < 0 || idx >= siblings.length - 1) return null;
    const next = siblings[idx + 1];
    return next ?? null;
  }

  /**
   * Returns all ancestors of this node, starting from its parent up to the root.
   *
   * @returns An array of ancestor nodes in order from closest parent to root.
   */
  ancestors(): Node[] {
    const list: Node[] = [];
    let n: Node | null = this.parent;
    while (n) {
      list.push(n);
      n = n.parent;
    }
    return list;
  }

  /**
   * Returns all descendants of this node (children, grandchildren, etc.).
   *
   * @returns A flat array of all descendant nodes.
   */
  descendants(): Node[] {
    const out: Node[] = [];
    for (const c of this.children) {
      out.push(c, ...c.descendants());
    }
    return out;
  }

  /**
   * Returns the path from the root node down to this node (inclusive).
   *
   * @returns An array of nodes starting with the root and ending with this node.
   */
  pathFromRoot(): Node[] {
    return [...this.ancestors()].reverse().concat(this);
  }

  /**
   * Determines whether this node is an ancestor of another node.
   *
   * @param other The node to test against.
   * @returns `true` if this node is an ancestor of `other`, otherwise `false`.
   */
  isAncestorOf(other: Node): boolean {
    let n: Node | null = other.parent;
    while (n) {
      if (n === this) return true;
      n = n.parent;
    }
    return false;
  }

  /**
   * Determines whether this node is a descendant of another node.
   *
   * @param other The node to test against.
   * @returns `true` if this node is a descendant of `other`, otherwise `false`.
   */
  isDescendantOf(other: Node): boolean {
    return other.isAncestorOf(this);
  }

  /**
   * Determines whether this node's subtree contains another node.
   *
   * @param node The node to look for.
   * @returns `true` if `node` is this node or one of its descendants.
   */
  contains(node: Node): boolean {
    return node === this || this.isAncestorOf(node);
  }

  /**
   * Traverses the subtree rooted at this node in depth-first order.
   *
   * @param fn Callback invoked for each visited node.
   */
  traverse(fn: (n: Node) => void): void {
    fn(this);
    for (const c of this.children) c.traverse(fn);
  }

  /**
   * Traverses the subtree rooted at this node in breadth-first order.
   *
   * @param fn Callback invoked for each visited node.
   */
  traverseBF(fn: (n: Node) => void): void {
    const q: Node[] = [this];
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
   * Finds the first node in this subtree that matches the given predicate.
   *
   * @param predicate Function used to test each node.
   * @returns The first matching node, or `null` if none match.
   */
  find(predicate: (n: Node) => boolean): Node | null {
    if (predicate(this)) return this;
    for (const c of this.children) {
      const found = c.find(predicate);
      if (found) return found;
    }
    return null;
  }

  /**
   * Finds all nodes in this subtree that match the given predicate.
   *
   * @param predicate Function used to test each node.
   * @returns An array of all matching nodes (possibly empty).
   */
  findAll(predicate: (n: Node) => boolean): Node[] {
    const out: Node[] = [];
    this.traverse((n) => {
      if (predicate(n)) out.push(n);
    });
    return out;
  }

  /**
   * Finds a node in this subtree by its id.
   *
   * @param id The id to search for.
   * @returns The first node with the given id, or `null` if none is found.
   */
  findById(id: string): Node | null {
    return this.find((n) => n.id === id);
  }

  /**
   * Finds nodes in this subtree by name.
   *
   * @param name The name to search for.
   * @returns An array of all nodes with the given name.
   */
  findByName(name: string): Node[] {
    return this.findAll((n) => n.name === name);
  }
}
