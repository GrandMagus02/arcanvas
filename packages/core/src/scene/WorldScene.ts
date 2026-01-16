import { WorldVec3 } from "../utils/world/WorldVec3";
import { WorldOrigin, type WorldOriginOptions, type WorldPositioned } from "../utils/world/WorldOrigin";
import { Entity } from "./Entity";
import { Light } from "./Light";
import { RenderObject } from "./RenderObject";
import { WorldRenderObject } from "./WorldRenderObject";

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
 * This scene can contain both regular RenderObjects and WorldRenderObjects.
 * WorldRenderObjects have their local positions automatically updated
 * when the world origin changes.
 *
 * Usage:
 * 1. Create a WorldScene
 * 2. Add WorldRenderObjects with world-space positions
 * 3. Before rendering, call `updateForCamera(camera.worldPosition)`
 * 4. The scene will auto-recenter if needed and update all local positions
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
   * Adds a render object to the scene.
   */
  addObject(object: RenderObject | WorldRenderObject): void {
    this.add(object);
  }

  /**
   * Adds a light to the scene.
   */
  addLight(light: Light): void {
    this.lights.push(light);
  }

  /**
   * Gets all RenderObjects in the scene (both regular and world).
   */
  get renderObjects(): (RenderObject | WorldRenderObject)[] {
    const items: (RenderObject | WorldRenderObject)[] = [];
    this.traverse((node) => {
      if (node instanceof RenderObject || node instanceof WorldRenderObject) {
        items.push(node);
      }
    });
    return items;
  }

  /**
   * Gets only WorldRenderObjects that need origin updates.
   */
  get worldRenderObjects(): WorldRenderObject[] {
    const items: WorldRenderObject[] = [];
    this.traverse((node) => {
      if (node instanceof WorldRenderObject) {
        items.push(node);
      }
    });
    return items;
  }

  /**
   * Gets all WorldPositioned objects in the scene.
   */
  private get worldPositionedObjects(): Iterable<WorldPositioned> {
    return this.worldRenderObjects;
  }

  /**
   * Updates the scene for rendering from a camera at the given world position.
   *
   * This should be called once per frame before rendering:
   * 1. Checks if the world origin needs recentering
   * 2. If recentered, updates all WorldRenderObject local positions
   * 3. If not recentered but origin is dirty, still updates positions
   *
   * @param cameraWorldPos The camera's current world-space position
   * @returns true if recentering occurred
   */
  updateForCamera(cameraWorldPos: WorldVec3): boolean {
    const recentered = this.worldOrigin.update(cameraWorldPos, this.worldPositionedObjects);

    // If we didn't recenter but objects might be newly added, update them too
    if (!recentered) {
      // Only update if origin is dirty (was set externally)
      if (this.worldOrigin.dirty) {
        this.worldOrigin.updateLocalPositions(this.worldPositionedObjects);
        this.worldOrigin.clearDirty();
      }
    }

    return recentered;
  }

  /**
   * Updates a single object's local position.
   * Call this when adding a new WorldRenderObject to an existing scene.
   */
  updateObjectLocal(obj: WorldRenderObject): void {
    this.worldOrigin.updateLocalPosition(obj);
  }

  /**
   * Forces update of all object local positions.
   * Call this after bulk changes to the scene.
   */
  forceUpdateAllLocalPositions(): void {
    this.worldOrigin.updateLocalPositions(this.worldPositionedObjects);
  }

  /**
   * Gets the current world origin.
   */
  get origin(): WorldVec3 {
    return this.worldOrigin.origin;
  }

  /**
   * Sets the world origin directly.
   * This will mark the origin as dirty, causing local positions to update
   * on the next updateForCamera() call.
   */
  set origin(value: WorldVec3) {
    this.worldOrigin.origin = value;
  }

  /**
   * Converts a local position back to world position.
   */
  localToWorld(local: Float32Array | number[], offset: number = 0): WorldVec3 {
    return this.worldOrigin.localToWorld(local, offset);
  }
}
