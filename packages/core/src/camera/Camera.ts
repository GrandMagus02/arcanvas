import { Vector3 } from "@arcanvas/vector";
import type { Arcanvas } from "../Arcanvas";
import { EventKey } from "../utils";
import { ProjectionMatrix } from "../utils/ProjectionMatrix";
import { Subscribable } from "../utils/Subscribable";
import { ViewMatrix } from "../utils/ViewMatrix";
import { CameraEventKey } from "./CameraEvents";

/**
 * Base Camera class that controls the view and projection.
 * Cameras are not Nodes - they are separate instances that control what is rendered.
 */
export class Camera extends Subscribable {
  protected _arc: Arcanvas | undefined = undefined;
  protected _pos: Vector3 = new Vector3();
  protected _view: ViewMatrix = new ViewMatrix(this._pos);
  protected _projection: ProjectionMatrix = new ProjectionMatrix();

  constructor(arc?: Arcanvas) {
    super();
    if (arc) {
      this.arcanvas = arc;
    }
  }

  set arcanvas(arc: Arcanvas) {
    this._arc = arc;
    this._arc?.on(EventKey.Resize, this.onResize.bind(this));
  }

  get arcanvas(): Arcanvas | undefined {
    return this._arc;
  }

  get projection(): ProjectionMatrix {
    return this._projection;
  }

  move(dx: number, dy: number, dz: number): void {
    this._pos.x += dx;
    this._pos.y += dy;
    this._pos.z += dz;
    this._view.update(this._pos);
    this.emit(CameraEventKey.Move, this._pos.x, this._pos.y, this._pos.z);
  }

  rotateX(dx: number): void {
    this._pos.x += dx;
    this._view.update(this._pos);
    this.emit(CameraEventKey.Rotate, this._pos.x, this._pos.y, this._pos.z);
  }

  rotateY(dy: number): void {
    this._pos.y += dy;
    this._view.update(this._pos);
    this.emit(CameraEventKey.Rotate, this._pos.x, this._pos.y, this._pos.z);
  }

  rotateZ(dz: number): void {
    this._pos.z += dz;
    this._view.update(this._pos);
    this.emit(CameraEventKey.Rotate, this._pos.x, this._pos.y, this._pos.z);
  }

  get view(): ViewMatrix {
    return this._view;
  }

  protected onResize(...args: unknown[]): void {
    const width = args[0] as number;
    const height = args[1] as number;
    this._projection.update({
      aspect: width / height,
    });
  }
}
