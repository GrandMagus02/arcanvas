import { Transform } from "@arcanvas/scene";
import type { Mesh } from "./Mesh";
import type { BaseMaterial } from "./materials";

/**
 * Scene entity that binds mesh, material, and transform together.
 * This is the basic renderable unit in the scene.
 */
export class RenderObject {
  mesh: Mesh;
  material: BaseMaterial;
  transform: Transform;

  constructor(mesh: Mesh, material: BaseMaterial, transform: Transform = new Transform()) {
    this.mesh = mesh;
    this.material = material;
    this.transform = transform;
  }
}
