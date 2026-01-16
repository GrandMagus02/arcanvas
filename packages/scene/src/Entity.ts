import { TreeNode, TreeNodeCycleError, TreeNodeSelfAttachmentError } from "./graph/TreeNode";
import type { Cloneable, Identifiable, JSONSerializable, Named } from "./interfaces";
import { uuid } from "./utils/uuid";

/**
 * JSON representation of an Entity.
 */
export interface EntityJSON {
  id: string;
  name?: string | undefined;
  parent?: string | undefined;
  children?: EntityJSON[] | undefined;
  visible?: boolean | undefined;
}

/**
 * Interface for objects that are Entity-like.
 */
export interface EntityLike<T extends EntityLike<T>> extends Identifiable, Named {
  findById(id: string): T | null;
  findByName(name: string): T[];
}

/**
 * An Entity in the scene graph.
 * Provides identity, naming, and serialization on top of TreeNode.
 */
export class Entity extends TreeNode<Entity> implements EntityLike<Entity>, Cloneable<Entity>, JSONSerializable<EntityJSON> {
  id: string;
  name: string | null = null;
  visible: boolean = true;

  constructor(name: string | null = null, id: string = uuid()) {
    super();
    this.id = id;
    this.name = name;
  }

  /**
   * Creates a new Entity instance for cloning.
   */
  protected createCloneInstance(): Entity {
    return new Entity(this.name);
  }

  /**
   * Creates a shallow or deep clone of this entity.
   */
  clone(deep: boolean = false): Entity {
    const instance = this.createCloneInstance();
    if (deep) {
      for (const child of this.children) {
        instance.add(child.clone(true));
      }
    }
    return instance;
  }

  /**
   * Creates a deep clone of this entity.
   */
  deepClone(): Entity {
    return this.clone(true);
  }

  protected override ensureCanAttach(child: Entity): void {
    if (child === this) {
      throw new TreeNodeSelfAttachmentError();
    }
    if (child.contains(this)) {
      throw new TreeNodeCycleError();
    }
  }

  toJSON(): EntityJSON {
    return {
      id: this.id,
      name: this.name ?? undefined,
      parent: this.parent?.id,
      children: this.children.map((c) => c.toJSON()),
      visible: this.visible,
    };
  }

  static fromJSON(json: EntityJSON): Entity {
    const node = new Entity(json.name, json.id);
    node.visible = json.visible ?? true;
    for (const cj of json.children ?? []) {
      node.add(Entity.fromJSON(cj));
    }
    return node;
  }

  findById(id: string): Entity | null {
    return this.find((n) => n.id === id);
  }

  findByName(name: string): Entity[] {
    return this.findAll((n) => n.name === name);
  }
}
