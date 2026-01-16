import type { Cloneable, Identifiable, JSONSerializable, Named } from "../infrastructure/interfaces";
import { applyMixins, CloneMixin } from "../utils/mixins";
import { uuid } from "../utils/uuid";
import { TreeNode, TreeNodeCycleError, TreeNodeSelfAttachmentError } from "./graph/TreeNode";

/**
 * JSON representation of a Entity.
 */
export interface EntityJSON {
  id: string;
  name?: string | undefined;
  parent?: string | undefined;
  children?: EntityJSON[] | undefined;
  visible?: boolean | undefined;
}

/**
 * Interface for objects that are Entity-like (have Entity-specific properties and methods).
 *
 * This interface combines Identifiable, Named, and Entity-specific search methods.
 * Useful for type constraints when working with Entity-like objects.
 *
 * @template T The type of the Entity-like object (typically Entity or a subclass).
 */
export interface EntityLike<T extends EntityLike<T>> extends Identifiable, Named {
  /**
   * Finds an Entity-like object in this subtree by its id.
   *
   * @param id The id to search for.
   * @returns The first object with the given id, or `null` if none is found.
   */
  findById(id: string): T | null;

  /**
   * Finds Entity-like objects in this subtree by name.
   *
   * @param name The name to search for.
   * @returns An array of all objects with the given name.
   */
  findByName(name: string): T[];
}

/**
 * A Entity in the scene graph.
 */
export class Entity extends TreeNode<Entity> implements EntityLike<Entity>, Cloneable<Entity>, JSONSerializable<EntityJSON> {
  id: string;
  name: string | null = null;
  visible: boolean = true;

  static {
    // Apply CloneMixin to Entity

    applyMixins(Entity, [CloneMixin]);
  }

  // Mixin methods (provided by CloneMixin)
  declare clone: (deep?: boolean) => Entity;
  declare deepClone: () => Entity;

  /**
   * Creates a new {@link Entity}.
   *
   * @param name Optional name for the Entity. Defaults to `null`.
   * @param id Optional id. If omitted, a new UUID will be generated.
   */
  constructor(name: string | null = null, id: string = uuid()) {
    super();
    this.id = id;
    this.name = name;
  }

  /**
   * Creates a new Entity instance for cloning purposes.
   *
   * @returns A new Entity instance without children.
   */
  protected createCloneInstance(): Entity {
    return new Entity(this.name);
  }

  /**
   * Ensures that the given child can be attached to this Entity.
   *
   * This check prevents invalid relationships such as attaching a Entity to itself
   * or introducing cycles in the hierarchy.
   *
   * @param child The Entity that will be attached as a child.
   * @throws TreeNodeSelfAttachmentError If `child` is this Entity.
   * @throws TreeNodeCycleError If `child` is an ancestor of this Entity (would create a cycle).
   */
  protected override ensureCanAttach(child: Entity): void {
    if (child === this) {
      throw new TreeNodeSelfAttachmentError();
    }
    if (child.contains(this)) {
      // If child is an ancestor of this, attaching would create a cycle
      throw new TreeNodeCycleError();
    }
  }

  /**
   * Serializes this Entity (and its children) into a JSON-friendly structure.
   *
   * @returns A {@link EntityJSON} object describing this subtree.
   */
  toJSON(): EntityJSON {
    return {
      id: this.id,
      name: this.name ?? undefined,
      parent: this.parent?.id,
      children: this.children.map((c) => c.toJSON()),
      visible: this.visible,
    };
  }

  /**
   * Reconstructs a Entity (and its subtree) from its JSON representation.
   *
   * @param json The serialized {@link EntityJSON} structure.
   * @returns The root {@link Entity} of the reconstructed subtree.
   */
  static fromJSON(json: EntityJSON): Entity {
    const node = new Entity(json.name, json.id);
    node.visible = json.visible ?? true;
    for (const cj of json.children ?? []) {
      node.add(Entity.fromJSON(cj));
    }
    return node;
  }

  /**
   * Finds a Entity in this subtree by its id.
   *
   * @param id The id to search for.
   * @returns The first Entity with the given id, or `null` if none is found.
   */
  findById(id: string): Entity | null {
    return this.find((n) => n.id === id);
  }

  /**
   * Finds Entities in this subtree by name.
   *
   * @param name The name to search for.
   * @returns An array of all Entities with the given name.
   */
  findByName(name: string): Entity[] {
    return this.findAll((n) => n.name === name);
  }
}
