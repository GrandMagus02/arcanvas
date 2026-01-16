import { Vector3 } from "@arcanvas/vector";
import type { IArcanvasContext } from "../infrastructure/interfaces/IArcanvasContext";
import { EventKey } from "../utils";
import { ProjectionMatrix } from "../utils/ProjectionMatrix";
import { ProjectionMode } from "../utils/ProjectionMode";
import { Subscribable } from "../utils/Subscribable";
import { TransformationMatrix } from "../utils/TransformationMatrix";
import { ViewMatrix } from "../utils/ViewMatrix";
import { WorldVec3, createWorldVec3, cloneWorldVec3, copyWorldVec3 } from "../utils/world/WorldVec3";
import { CameraEventKey } from "./CameraEvents";

/**
 * WorldCamera extends Camera with world-space coordinate support.
 *
 * Key concepts:
 * - `_worldPos` stores the camera position in double-precision (JS number)
 * - For rendering, we use camera-relative coordinates where the camera is always at (0,0,0)
 * - The view matrix represents orientation only (no translation for 2D, lookAt for 3D)
 *
 * This enables "infinite" zoom and pan without precision issues:
 * - Objects store their positions in world-space (double)
 * - At render time, we compute `objectWorldPos - cameraWorldPos` (still in double)
 * - Only the result (which is small) gets converted to Float32 for the GPU
 */
export class WorldCamera extends Subscribable {
  protected _arc: IArcanvasContext | undefined = undefined;
  protected _worldPos: WorldVec3 = createWorldVec3(0, 0, 0);
  protected _pixelsPerUnit: number = 1;

  // For camera-relative rendering, the view matrix doesn't include camera position
  // It only handles rotation/orientation
  protected _view: ViewMatrix;
  protected _projection: ProjectionMatrix = new ProjectionMatrix();

  // Orientation for 3D cameras
  protected _target: WorldVec3 = createWorldVec3(0, 0, -1); // Look direction
  protected _up: Vector3 = new Vector3(new Float32Array([0, 1, 0]));

  constructor(arc?: IArcanvasContext) {
    super();
    // Initialize view matrix with identity (no translation, no rotation)
    // For 2D this represents no rotation
    this._view = new ViewMatrix(new Vector3(new Float32Array([0, 0, 0])), new Vector3(new Float32Array([0, 0, 0])));

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
    if (this._arc) {
      this.onResize(this._arc.canvas.width, this._arc.canvas.height);
    }
  }

  /**
   * Gets the world-space position (double precision).
   * This is the camera's "true" position in the world.
   */
  get worldPosition(): WorldVec3 {
    return cloneWorldVec3(this._worldPos);
  }

  /**
   * Sets the world-space position.
   */
  set worldPosition(value: WorldVec3 | { x: number; y: number; z: number }) {
    if (value instanceof WorldVec3) {
      this._worldPos.x = value.x;
      this._worldPos.y = value.y;
      this._worldPos.z = value.z;
    } else {
      copyWorldVec3(this._worldPos, value);
    }
    this._updateView();
    this.emit(CameraEventKey.Move, this._worldPos.x, this._worldPos.y, this._worldPos.z);
  }

  /**
   * Gets a reference to the world position (avoid allocation in tight loops).
   * DO NOT MODIFY the returned object directly!
   */
  get worldPositionRef(): Readonly<WorldVec3> {
    return this._worldPos;
  }

  /**
   * For backward compatibility with Camera interface.
   * Returns a Vector3 (Float32), but this may lose precision for large coordinates.
   * Prefer using worldPosition for precise coordinates.
   */
  get position(): Vector3 {
    return new Vector3(new Float32Array([this._worldPos.x, this._worldPos.y, this._worldPos.z]));
  }

  /**
   * Moves the camera by the given delta in world space.
   */
  move(dx: number, dy: number, dz: number): void {
    this._worldPos.x += dx;
    this._worldPos.y += dy;
    this._worldPos.z += dz;
    this._updateView();
    this.emit(CameraEventKey.Move, this._worldPos.x, this._worldPos.y, this._worldPos.z);
  }

  /**
   * Sets the camera position directly in world space.
   */
  setWorldPosition(x: number, y: number, z: number): this {
    this._worldPos.x = x;
    this._worldPos.y = y;
    this._worldPos.z = z;
    this._updateView();
    this.emit(CameraEventKey.Move, x, y, z);
    return this;
  }

  // Rotation methods (for 3D cameras)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rotateX(_dx: number): void {
    // Implement 3D rotation if needed
    this._updateView();
    this.emit(CameraEventKey.Rotate, this._worldPos.x, this._worldPos.y, this._worldPos.z);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rotateY(_dy: number): void {
    this._updateView();
    this.emit(CameraEventKey.Rotate, this._worldPos.x, this._worldPos.y, this._worldPos.z);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rotateZ(_dz: number): void {
    this._updateView();
    this.emit(CameraEventKey.Rotate, this._worldPos.x, this._worldPos.y, this._worldPos.z);
  }

  get view(): ViewMatrix {
    return this._view;
  }

  /**
   * Updates the view matrix.
   * For camera-relative rendering with 2D cameras, this is an identity matrix.
   * For 3D cameras, this would include rotation but NOT translation.
   */
  protected _updateView(): void {
    // For 2D camera-relative rendering, the view matrix is identity
    // (all translation is handled by computing object positions relative to camera)
    // The parent Camera class uses eye=center for 2D which produces a translation matrix
    // We override this to produce an identity matrix for true camera-relative rendering

    // If you want 3D lookAt behavior, you'd compute the rotation part only:
    // this._view.update(origin, this._target, this._up);
    // But for camera-relative, that would be lookAt(origin, origin + viewDir, up)

    // For now, keep the 2D behavior: identity view matrix
    // The translation is applied by computing object.worldPos - camera.worldPos
    this._view.update(new Vector3(new Float32Array([0, 0, 0])), new Vector3(new Float32Array([0, 0, 0])));
  }

  /**
   * Get the combined view-projection matrix.
   * For camera-relative rendering, this is just the projection matrix
   * since view is identity.
   */
  getViewProjectionMatrix(): TransformationMatrix {
    const result = this._projection.mult(this._view);

    let matrixData: Float32Array;
    if (result.data instanceof Float32Array && result.data.length === 16) {
      matrixData = result.data;
    } else {
      matrixData = new Float32Array(16);
      for (let i = 0; i < 16; i++) {
        matrixData[i] = result.data[i] || 0;
      }
    }

    return new TransformationMatrix(matrixData);
  }

  protected onResize(...args: unknown[]): void {
    const width = args[0] as number;
    const height = args[1] as number;
    if (this._projection.mode === ProjectionMode.Perspective) {
      this._projection.update({
        aspect: width / height,
      });
    }
  }
}
