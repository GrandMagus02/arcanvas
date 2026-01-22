import { Vector3 } from "@arcanvas/math";
import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";
import { EventKey } from "../utils";
import { ProjectionMatrix } from "../utils/ProjectionMatrix";
import { ProjectionMode } from "../utils/ProjectionMode";
import { Subscribable } from "../utils/Subscribable";
import { TransformationMatrix } from "../utils/TransformationMatrix";
import { ViewMatrix } from "../utils/ViewMatrix";
import { CameraEventKey } from "./CameraEvents";

/**
 * Base Camera class that controls the view and projection.
 * Cameras are not Nodes - they are separate instances that control what is rendered.
 */
export class Camera extends Subscribable {
  protected _arc: IArcanvasContext | undefined = undefined;
  protected _pos: Vector3 = new Vector3();
  protected _pixelsPerUnit: number = 1;
  // Initialize view matrix with eye = center for 2D camera (simple translation)
  protected _view: ViewMatrix = new ViewMatrix(this._pos, this._pos);
  protected _projection: ProjectionMatrix = new ProjectionMatrix();

  constructor(arc?: IArcanvasContext) {
    super();
    if (arc) {
      this.arcanvas = arc;
    }
  }

  set arcanvas(arc: IArcanvasContext) {
    this._arc = arc;
    this._arc?.on(EventKey.Resize, this.onResize.bind(this));
  }

  get arcanvas(): IArcanvasContext | undefined {
    return this._arc;
  }

  get projection(): ProjectionMatrix {
    return this._projection;
  }

  get pixelsPerUnit(): number {
    return this._pixelsPerUnit;
  }

  set pixelsPerUnit(value: number) {
    this._pixelsPerUnit = value;
    // Trigger resize or update projection if possible
    if (this._arc) {
      this.onResize(this._arc.canvas.width, this._arc.canvas.height);
    }
  }

  move(dx: number, dy: number, dz: number): void {
    this._pos.x += dx;
    this._pos.y += dy;
    this._pos.z += dz;
    // For 2D camera, always use eye = center to get simple translation matrix
    // Update view with eye = _pos and center = _pos (same position)
    this._view.update(this._pos, this._pos);
    this.emit(CameraEventKey.Move, this._pos.x, this._pos.y, this._pos.z);
  }

  rotateX(dx: number): void {
    this._pos.x += dx;
    this._view.update(this._pos, this._pos);
    this.emit(CameraEventKey.Rotate, this._pos.x, this._pos.y, this._pos.z);
  }

  rotateY(dy: number): void {
    this._pos.y += dy;
    this._view.update(this._pos, this._pos);
    this.emit(CameraEventKey.Rotate, this._pos.x, this._pos.y, this._pos.z);
  }

  rotateZ(dz: number): void {
    this._pos.z += dz;
    this._view.update(this._pos, this._pos);
    this.emit(CameraEventKey.Rotate, this._pos.x, this._pos.y, this._pos.z);
  }

  get view(): ViewMatrix {
    return this._view;
  }

  /**
   * Get the current camera position.
   * @returns A clone of the camera position vector.
   */
  get position(): Vector3 {
    return new Vector3(new Float32Array([this._pos.x, this._pos.y, this._pos.z]));
  }

  /**
   * Get the combined view-projection matrix (projection * view).
   * This matrix transforms world coordinates to clip space.
   * @returns A TransformationMatrix representing the view-projection transformation.
   */
  getViewProjectionMatrix(): TransformationMatrix {
    // Multiply projection * view (in that order for WebGL)
    // Both matrices are Matrix4, and mult() returns a Matrix, so we need to convert to TransformationMatrix
    const result = this._projection.mult(this._view);

    // Ensure we have a Float32Array with 16 elements
    let matrixData: Float32Array;
    if (result.data instanceof Float32Array && result.data.length === 16) {
      matrixData = result.data;
    } else {
      // Convert to Float32Array if needed
      matrixData = new Float32Array(16);
      for (let i = 0; i < 16; i++) {
        matrixData[i] = result.data[i] || 0;
      }
    }

    // Create TransformationMatrix from the result data
    return new TransformationMatrix(matrixData);
  }

  protected onResize(...args: unknown[]): void {
    const width = args[0] as number;
    const height = args[1] as number;
    // Only update aspect for perspective projection
    // Orthographic projections should be handled by camera controllers
    if (this._projection.mode === ProjectionMode.Perspective) {
      this._projection.update({
        aspect: width / height,
      });
    }
  }
}
