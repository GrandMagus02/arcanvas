import type { Mesh } from "../rendering/engine/Mesh";
import type { BaseMaterial } from "../rendering/engine/materials";
import type { WorldVec3 } from "../utils/world/WorldVec3";
import type { WorldPositioned } from "../utils/world/WorldOrigin";
import { Entity } from "./Entity";
import { WorldTransform } from "./WorldTransform";

/**
 * WorldRenderObject is a RenderObject that supports world-space coordinates.
 *
 * Use this for objects that need to exist in a large world where
 * coordinates might exceed Float32 precision limits.
 *
 * Implements WorldPositioned interface for use with WorldOrigin manager.
 */
export class WorldRenderObject extends Entity implements WorldPositioned {
  mesh: Mesh;
  material: BaseMaterial;
  transform: WorldTransform;

  constructor(mesh: Mesh, material: BaseMaterial, transform: WorldTransform = new WorldTransform()) {
    super();
    this.mesh = mesh;
    this.material = material;
    this.transform = transform;
  }

  /**
   * Gets the world-space position (double precision).
   * Part of WorldPositioned interface.
   */
  get worldPosition(): WorldVec3 {
    return this.transform.worldPositionRef as WorldVec3;
  }

  /**
   * Sets the world-space position.
   */
  set worldPosition(value: WorldVec3 | { x: number; y: number; z: number }) {
    this.transform.worldPosition = value;
  }

  /**
   * Gets the local position (relative to world origin).
   * Part of WorldPositioned interface.
   */
  get localPosition(): Float32Array {
    return this.transform.localPosition;
  }

  /**
   * Sets the world position by components.
   */
  setWorldPosition(x: number, y: number, z: number): this {
    this.transform.setWorldPosition(x, y, z);
    return this;
  }

  /**
   * Translates the object in world space.
   */
  translateWorld(dx: number, dy: number, dz: number): this {
    this.transform.translateWorld(dx, dy, dz);
    return this;
  }

  /**
   * Sets rotation (Euler angles in radians).
   */
  setRotation(x: number, y: number, z: number): this {
    this.transform.setRotation(x, y, z);
    return this;
  }

  /**
   * Sets scale factors.
   */
  setScale(x: number, y: number, z: number): this {
    this.transform.setScale(x, y, z);
    return this;
  }

  /**
   * Sets uniform scale.
   */
  setUniformScale(s: number): this {
    this.transform.setUniformScale(s);
    return this;
  }

  /**
   * Updates local position from world position and origin.
   * Call this when the world origin changes or before rendering.
   */
  updateLocal(origin: WorldVec3): void {
    this.transform.updateLocal(origin);
  }
}
