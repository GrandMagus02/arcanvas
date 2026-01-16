import { Entity, WorldTransform, type WorldVec3, type WorldPositioned } from "@arcanvas/scene";
import type { Mesh } from "./Mesh";
import type { BaseMaterial } from "./materials";

/**
 * WorldRenderObject is a RenderObject that supports world-space coordinates.
 *
 * Use this for objects in large worlds where coordinates might exceed
 * Float32 precision limits.
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

  get worldPosition(): WorldVec3 {
    return this.transform.worldPositionRef as WorldVec3;
  }

  set worldPosition(value: WorldVec3 | { x: number; y: number; z: number }) {
    this.transform.worldPosition = value;
  }

  get localPosition(): Float32Array {
    return this.transform.localPosition;
  }

  setWorldPosition(x: number, y: number, z: number): this {
    this.transform.setWorldPosition(x, y, z);
    return this;
  }

  translateWorld(dx: number, dy: number, dz: number): this {
    this.transform.translateWorld(dx, dy, dz);
    return this;
  }

  setRotation(x: number, y: number, z: number): this {
    this.transform.setRotation(x, y, z);
    return this;
  }

  setScale(x: number, y: number, z: number): this {
    this.transform.setScale(x, y, z);
    return this;
  }

  setUniformScale(s: number): this {
    this.transform.setUniformScale(s);
    return this;
  }

  updateLocal(origin: WorldVec3): void {
    this.transform.updateLocal(origin);
  }
}
