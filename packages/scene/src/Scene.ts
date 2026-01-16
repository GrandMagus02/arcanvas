import { Entity } from "./Entity";
import { Light } from "./Light";

/**
 * Scene viewport dimensions.
 */
export interface SceneViewport {
  width: number;
  height: number;
}

/**
 * Interface for renderable objects (duck typing for cross-package compatibility).
 */
export interface Renderable {
  mesh?: unknown;
  material?: unknown;
}

/**
 * Scene root for the engine-level renderer.
 * Provides a container for entities and lights.
 */
export class Scene extends Entity {
  viewport: SceneViewport;
  lights: Light[] = [];

  constructor(viewport: SceneViewport = { width: 1, height: 1 }) {
    super();
    this.viewport = viewport;
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
   * Gets all entities in the scene (flat list).
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
   * Returns objects in the format expected by Renderer.
   */
  get renderObjects(): Array<{
    mesh: unknown;
    material: unknown;
    transform: { modelMatrix: Float32Array };
  }> {
    const items: Array<{
      mesh: unknown;
      material: unknown;
      transform: { modelMatrix: Float32Array };
    }> = [];
    this.traverse((node) => {
      if (node !== this && this.isRenderable(node)) {
        const renderable = node as Entity & Renderable & { transform?: { modelMatrix: Float32Array } };
        if (renderable.transform && "modelMatrix" in renderable.transform) {
          items.push({
            mesh: renderable.mesh,
            material: renderable.material,
            transform: { modelMatrix: renderable.transform.modelMatrix },
          });
        }
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
}
