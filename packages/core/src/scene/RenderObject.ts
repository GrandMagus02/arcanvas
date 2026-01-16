import { Entity } from "./Entity";
import { Transform } from "./Transform";
import type { Mesh } from "../rendering/engine/Mesh";
import type { BaseMaterial } from "../rendering/engine/materials";

/**
 * Scene entity that binds mesh, material, and transform together.
 */
export class RenderObject extends Entity {
  mesh: Mesh;
  material: BaseMaterial;
  transform: Transform;

  constructor(mesh: Mesh, material: BaseMaterial, transform: Transform = new Transform()) {
    super();
    this.mesh = mesh;
    this.material = material;
    this.transform = transform;
  }
}
