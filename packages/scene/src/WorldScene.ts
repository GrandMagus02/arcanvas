import { Entity } from "./Entity";
import { Light } from "./Light";
import type { Renderable } from "./Scene";
import { WorldVec3 } from "./utils/WorldVec3";
import { WorldOrigin, type WorldOriginOptions, type WorldPositioned } from "./utils/WorldOrigin";

/**
 * Scene viewport dimensions.
 */
export interface WorldSceneViewport {
  width: number;
  height: number;
}

/**
 * WorldScene extends Scene with floating origin support.
 *
 * This scene can contain both regular entities and world-positioned entities.
 * World-positioned entities have their local positions automatically updated
 * when the world origin changes.
 */
export class WorldScene extends Entity {
  viewport: WorldSceneViewport;
  lights: Light[] = [];
  readonly worldOrigin: WorldOrigin;

  constructor(viewport: WorldSceneViewport = { width: 1, height: 1 }, originOptions: Partial<WorldOriginOptions> = {}) {
    super();
    this.viewport = viewport;
    this.worldOrigin = new WorldOrigin(originOptions);
  }

  /**
   * Adds an object to the scene.
   */
  addObject(object: Entity): void {
    this.add(object);
  }

  /**
   * Adds a light to the scene.
   */
  addLight(light: Light): void {
    this.lights.push(light);
  }

  /**
   * Gets all entities in the scene.
   */
  get entities(): Entity[] {
    const items: Entity[] = [];
    this.traverse((node) => {
      if (node !== this) items.push(node);
    });
    return items;
  }

  /**
   * Gets all renderable objects in the scene.
   * Uses duck typing to identify objects with mesh and material properties.
   */
  get renderObjects(): (Entity & Renderable)[] {
    const items: (Entity & Renderable)[] = [];
    this.traverse((node) => {
      if (node !== this && this.isRenderable(node)) {
        items.push(node as Entity & Renderable);
      }
    });
    return items;
  }

  /**
   * Checks if an entity is renderable (has mesh and material).
   */
  private isRenderable(entity: Entity): entity is Entity & Renderable {
    return "mesh" in entity && "material" in entity;
  }

  /**
   * Gets all WorldPositioned objects in the scene.
   */
  private getWorldPositionedObjects(): WorldPositioned[] {
    const items: WorldPositioned[] = [];
    this.traverse((node) => {
      if (node !== this && "worldPosition" in node && "localPosition" in node && "updateLocal" in node) {
        items.push(node as unknown as WorldPositioned);
      }
    });
    return items;
  }

  /**
   * Updates the scene for rendering from a camera at the given world position.
   * @returns true if recentering occurred
   */
  updateForCamera(cameraWorldPos: WorldVec3): boolean {
    const objects = this.getWorldPositionedObjects();
    const recentered = this.worldOrigin.update(cameraWorldPos, objects);

    if (!recentered && this.worldOrigin.dirty) {
      this.worldOrigin.updateLocalPositions(objects);
      this.worldOrigin.clearDirty();
    }

    return recentered;
  }

  /**
   * Updates a single object's local position.
   */
  updateObjectLocal(obj: WorldPositioned): void {
    this.worldOrigin.updateLocalPosition(obj);
  }

  /**
   * Forces update of all object local positions.
   */
  forceUpdateAllLocalPositions(): void {
    this.worldOrigin.updateLocalPositions(this.getWorldPositionedObjects());
  }

  get origin(): WorldVec3 {
    return this.worldOrigin.origin;
  }

  set origin(value: WorldVec3) {
    this.worldOrigin.origin = value;
  }

  localToWorld(local: Float32Array | number[], offset: number = 0): WorldVec3 {
    return this.worldOrigin.localToWorld(local, offset);
  }
}
