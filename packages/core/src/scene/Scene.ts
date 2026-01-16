import { Entity } from "./Entity";
import { Light } from "./Light";
import { RenderObject } from "./RenderObject";

/**
 *
 */
export interface SceneViewport {
  width: number;
  height: number;
}

/**
 * Scene root for the engine-level renderer.
 */
export class Scene extends Entity {
  viewport: SceneViewport;
  lights: Light[] = [];

  constructor(viewport: SceneViewport = { width: 1, height: 1 }) {
    super();
    this.viewport = viewport;
  }

  addObject(object: RenderObject): void {
    this.add(object);
  }

  addLight(light: Light): void {
    this.lights.push(light);
  }

  get renderObjects(): RenderObject[] {
    const items: RenderObject[] = [];
    this.traverse((node) => {
      if (node instanceof RenderObject) items.push(node);
    });
    return items;
  }
}
