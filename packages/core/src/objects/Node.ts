// import type { Float64Matrix3x3 } from "@arcanvas/matrix";
import { Transform } from "../utils/Transform";

/**
 *
 */
export class Node {
  name: string = "Node";
  transform = new Transform();
  parent: Node | null = null;
  children: Node[] = [];

  add(child: Node): this {
    child.parent = this;
    this.children.push(child);
    return this;
  }

  remove(): void {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((c) => c !== this);
    }
    this.parent = null;
  }

  // getWorldMatrix(): Float64Matrix3x3 {
  //   const local = this.transform.getLocalMatrix();
  //   if (!this.parent) return local;
  //   return this.parent.getWorldMatrix().matMul(local);
  //   // Note: caching is a nice future optimization.
  // }

  traverse(fn: (n: Node) => void): void {
    fn(this);
    for (const c of this.children) c.traverse(fn);
  }
}
