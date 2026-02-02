import { Entity, Transform3D } from "@arcanvas/scene";
import type { Mesh } from "./Mesh";
import type { BaseMaterial } from "./materials";

/**
 * Scene entity that binds mesh, material, and transform together.
 * This is the basic renderable unit in the scene.
 */
export class RenderObject extends Entity {
  mesh: Mesh;
  material: BaseMaterial;
  transform: Transform3D;

  constructor(mesh: Mesh, material: BaseMaterial, transform: Transform3D = new Transform3D()) {
    super();
    this.mesh = mesh;
    this.material = material;
    this.transform = transform;
  }
}
