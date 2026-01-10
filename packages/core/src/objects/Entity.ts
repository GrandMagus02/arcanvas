import { uuid } from "../utils/uuid";

/**
 * JSON representation of an Entity.
 */
export interface EntityJSON {
  id: string;
  name?: string | undefined;
  parent?: string | undefined;
  children?: EntityJSON[] | undefined;
}

/**
 * Base error type for all {@link Entity}-related errors.
 */
export class EntityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EntityError";
  }
}

/**
 * Error thrown when attempting to attach an {@link Entity} as a child of itself.
 */
export class EntitySelfAttachmentError extends EntityError {
  constructor() {
    super("Cannot attach an entity to itself.");
    this.name = "EntitySelfAttachmentError";
  }
}

/**
 * Error thrown when an operation would introduce a cycle into the entity hierarchy.
 */
export class EntityCycleError extends EntityError {
  constructor() {
    super("Cannot create cycles (child is an ancestor).");
    this.name = "EntityCycleError";
  }
}

/**
 * An entity in the scene graph.
 */
export class Entity {
  id: string;
  name: string | null = null;
  parent: Entity | null = null;
  children: Entity[] = [];

  /**
   * Creates a new {@link Entity}.
   *
   * @param name Optional name for the entity. Defaults to `null`.
   * @param id Optional id. If omitted, a new UUID will be generated.
   */
  constructor(name: string | null = null, id: string = uuid()) {
    this.id = id;
    this.name = name;
  }

  /**
   * Ensures that the given child can be attached to this entity.
   *
   * This check prevents invalid relationships such as attaching an entity to itself
   * or introducing cycles in the hierarchy.
   *
   * @param child The entity that will be attached as a child.
   * @throws EntitySelfAttachmentError If `child` is this entity.
   * @throws EntityCycleError If `child` is an ancestor of this entity (would create a cycle).
   */
  private ensureCanAttach(child: Entity): void {
    if (child === this) {
      throw new EntitySelfAttachmentError();
    }
    if (child.contains(this)) {
      // If child is an ancestor of this, attaching would create a cycle
      throw new EntityCycleError();
    }
  }

  /**
   * Creates a copy of this entity.
   *
   * @param deep When `true`, all descendants are also cloned recursively.
   *             When `false`, the clone has no children.
   * @returns A cloned {@link Entity} instance.
   */
  clone(deep: boolean = true): Entity {
    const copy = new Entity(this.name);
    if (deep) {
      for (const child of this.children) {
        const childClone = child.clone(true);
        copy.add(childClone);
      }
    }
    return copy;
  }

  /**
   * Convenience alias for {@link Entity.clone} with `deep` set to `true`.
   *
   * @returns A deep clone of this entity and its descendants.
   */
  deepClone(): Entity {
    return this.clone(true);
  }

  /**
   * Serializes this entity (and its children) into a JSON-friendly structure.
   *
   * @returns A {@link EntityJSON} object describing this subtree.
   */
  toJSON(): EntityJSON {
    return {
      id: this.id,
      name: this.name ?? undefined,
      parent: this.parent?.id,
      children: this.children.map((c) => c.toJSON()),
    };
  }

  /**
   * Reconstructs an entity (and its subtree) from its JSON representation.
   *
   * @param json The serialized {@link EntityJSON} structure.
   * @returns The root {@link Entity} of the reconstructed subtree.
   */
  static fromJSON(json: EntityJSON): Entity {
    const entity = new Entity(json.name, json.id);
    for (const cj of json.children ?? []) {
      entity.add(Entity.fromJSON(cj));
    }
    return entity;
  }

  /**
   * Adds a child entity to this entity, reparenting it if necessary.
   *
   * If the child already has a parent, it will be removed from that parent before
   * being attached here.
   *
   * @param child The entity to add as a child.
   * @returns `this`, for chaining.
   * @throws EntityError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  add(child: Entity): this {
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
   * If the child already has a parent, it will be reparented to this entity first.
   * The index is clamped to the `[0, children.length]` range.
   *
   * @param child The entity to insert.
   * @param index Target index in the children list (clamped if out of range).
   * @returns `this`, for chaining.
   * @throws EntityError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  addAt(child: Entity, index: number): this {
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
   * Detaches this entity from its parent, if it has one.
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
   * Removes the given entity from this entity's children.
   *
   * If the entity is not a direct child, this is a no-op.
   *
   * @param child The child entity to remove.
   */
  removeChild(child: Entity): void {
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
   * Replaces an existing child with a new entity.
   *
   * The new child will be reparented to this entity, and the old child's parent
   * reference will be cleared. If `oldChild` is not a child of this entity, this
   * method does nothing.
   *
   * @param oldChild The existing child to replace.
   * @param newChild The new child entity.
   * @throws EntityError If the attachment would be invalid (see {@link ensureCanAttach}).
   */
  replaceChild(oldChild: Entity, newChild: Entity): void {
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
   * Replaces this entity in its parent with another entity.
   *
   * If this entity has no parent, this is a no-op.
   *
   * @param entity The entity to insert in place of this entity.
   */
  replaceWith(entity: Entity): void {
    if (!this.parent) return;
    this.parent.replaceChild(this, entity);
  }

  /**
   * Moves this entity to a new parent, optionally at a specific index.
   *
   * If the new parent is the same as the current parent and `index` is `undefined`,
   * the operation is a no-op.
   *
   * @param newParent The entity that will become this entity's new parent.
   * @param index Optional index to insert at in the new parent's children list.
   * @throws EntityError If the move would result in an invalid hierarchy.
   */
  moveTo(newParent: Entity, index?: number): void {
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
   * Indicates whether this entity is a root entity (has no parent).
   */
  get isRoot(): boolean {
    return this.parent === null;
  }

  /**
   * Indicates whether this entity is a leaf entity (has no children).
   */
  get isLeaf(): boolean {
    return this.children.length === 0;
  }

  /**
   * The root entity of the tree that this entity belongs to.
   *
   * If this entity has no parent, it is its own root.
   */
  get root(): Entity {
    return this.parent ? this.parent.root : this;
  }

  /**
   * The depth of this entity in the tree.
   *
   * Roots have depth `0`; direct children of the root have depth `1`, and so on.
   */
  get depth(): number {
    let d = 0;
    let n: Entity | null = this.parent;
    while (n) {
      d++;
      n = n.parent;
    }
    return d;
  }

  /**
   * The height of this entity in the tree.
   *
   * Leaf entities have height `0`. An entity with children has a height of
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
   * Counts the number of entities in the subtree rooted at this entity.
   *
   * @returns The total number of entities including this entity.
   */
  size(): number {
    let count = 1;
    const children = this.children;
    for (const c of children) count += c.size();
    return count;
  }

  /**
   * Returns this entity's index in its parent's children array.
   *
   * @returns The zero-based index, or `-1` if this entity has no parent.
   */
  index(): number {
    const parent = this.parent;
    if (!parent) return -1;
    return parent.children.indexOf(this);
  }

  /**
   * Returns the siblings of this entity (other children of the same parent).
   *
   * @returns An array of sibling entities, or an empty array if this is a root.
   */
  siblings(): Entity[] {
    const parent = this.parent;
    if (!parent) return [];
    const siblings = parent.children;
    return siblings.filter((c) => c !== this);
  }

  /**
   * Returns the previous sibling of this entity, if any.
   *
   * @returns The previous sibling, or `null` if this entity is the first child or a root.
   */
  prevSibling(): Entity | null {
    const parent = this.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(this);
    if (idx <= 0) return null;
    const prev = siblings[idx - 1];
    return prev ?? null;
  }

  /**
   * Returns the next sibling of this entity, if any.
   *
   * @returns The next sibling, or `null` if this entity is the last child or a root.
   */
  nextSibling(): Entity | null {
    const parent = this.parent;
    if (!parent) return null;
    const siblings = parent.children;
    const idx = siblings.indexOf(this);
    if (idx < 0 || idx >= siblings.length - 1) return null;
    const next = siblings[idx + 1];
    return next ?? null;
  }

  /**
   * Returns all ancestors of this entity, starting from its parent up to the root.
   *
   * @returns An array of ancestor entities in order from closest parent to root.
   */
  ancestors(): Entity[] {
    const list: Entity[] = [];
    let n: Entity | null = this.parent;
    while (n) {
      list.push(n);
      n = n.parent;
    }
    return list;
  }

  /**
   * Returns all descendants of this entity (children, grandchildren, etc.).
   *
   * @returns A flat array of all descendant entities.
   */
  descendants(): Entity[] {
    const out: Entity[] = [];
    for (const c of this.children) {
      out.push(c, ...c.descendants());
    }
    return out;
  }

  /**
   * Returns the path from the root entity down to this entity (inclusive).
   *
   * @returns An array of entities starting with the root and ending with this entity.
   */
  pathFromRoot(): Entity[] {
    return [...this.ancestors()].reverse().concat(this);
  }

  /**
   * Determines whether this entity is an ancestor of another entity.
   *
   * @param other The entity to test against.
   * @returns `true` if this entity is an ancestor of `other`, otherwise `false`.
   */
  isAncestorOf(other: Entity): boolean {
    let n: Entity | null = other.parent;
    while (n) {
      if (n === this) return true;
      n = n.parent;
    }
    return false;
  }

  /**
   * Determines whether this entity is a descendant of another entity.
   *
   * @param other The entity to test against.
   * @returns `true` if this entity is a descendant of `other`, otherwise `false`.
   */
  isDescendantOf(other: Entity): boolean {
    return other.isAncestorOf(this);
  }

  /**
   * Determines whether this entity's subtree contains another entity.
   *
   * @param entity The entity to look for.
   * @returns `true` if `entity` is this entity or one of its descendants.
   */
  contains(entity: Entity): boolean {
    return entity === this || this.isAncestorOf(entity);
  }

  /**
   * Traverses the subtree rooted at this entity in depth-first order.
   *
   * @param fn Callback invoked for each visited entity.
   */
  traverse(fn: (n: Entity) => void): void {
    fn(this);
    for (const c of this.children) c.traverse(fn);
  }

  /**
   * Traverses the subtree rooted at this entity in breadth-first order.
   *
   * @param fn Callback invoked for each visited entity.
   */
  traverseBF(fn: (n: Entity) => void): void {
    const q: Entity[] = [this];
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
   * Finds the first entity in this subtree that matches the given predicate.
   *
   * @param predicate Function used to test each entity.
   * @returns The first matching entity, or `null` if none match.
   */
  find(predicate: (n: Entity) => boolean): Entity | null {
    if (predicate(this)) return this;
    for (const c of this.children) {
      const found = c.find(predicate);
      if (found) return found;
    }
    return null;
  }

  /**
   * Finds all entities in this subtree that match the given predicate.
   *
   * @param predicate Function used to test each entity.
   * @returns An array of all matching entities (possibly empty).
   */
  findAll(predicate: (n: Entity) => boolean): Entity[] {
    const out: Entity[] = [];
    this.traverse((n) => {
      if (predicate(n)) out.push(n);
    });
    return out;
  }

  /**
   * Finds an entity in this subtree by its id.
   *
   * @param id The id to search for.
   * @returns The first entity with the given id, or `null` if none is found.
   */
  findById(id: string): Entity | null {
    return this.find((n) => n.id === id);
  }

  /**
   * Finds entities in this subtree by name.
   *
   * @param name The name to search for.
   * @returns An array of all entities with the given name.
   */
  findByName(name: string): Entity[] {
    return this.findAll((n) => n.name === name);
  }
}
