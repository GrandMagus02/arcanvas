import { ProjectionMode } from "./ProjectionEnum";
import { TransformationMatrix } from "./TransformationMatrix";

/**
 * ProjectionMatrix is a 4x4 matrix that represents a projection in 3D space.
 */
export class ProjectionMatrix extends TransformationMatrix {
  private _projectionMode: ProjectionMode;
  private _fovY: number;
  private _aspect: number;
  private _near: number;
  private _far: number;
  private _clipZ01: boolean;

  constructor(
    data: ArrayLike<number> = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    projectionMode: ProjectionMode = ProjectionMode.Perspective,
    fovY: number = (60 * Math.PI) / 180,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 1000,
    clipZ01: boolean = false
  ) {
    const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    for (let i = 0; i < data.length; i++) {
      identity[i] = data[i]!;
    }
    super(
      identity[0],
      identity[1],
      identity[2],
      identity[3],
      identity[4],
      identity[5],
      identity[6],
      identity[7],
      identity[8],
      identity[9],
      identity[10],
      identity[11],
      identity[12],
      identity[13],
      identity[14],
      identity[15]
    );
    this._projectionMode = projectionMode;
    this._fovY = fovY;
    this._aspect = aspect;
    this._near = near;
    this._far = far;
    this._clipZ01 = clipZ01;
  }

  get projectionMode(): ProjectionMode {
    return this._projectionMode;
  }

  set projectionMode(value: ProjectionMode) {
    this._projectionMode = value;
  }

  get fovY(): number {
    return this._fovY;
  }

  set fovY(value: number) {
    this._fovY = value;
  }

  get aspect(): number {
    return this._aspect;
  }

  set aspect(value: number) {
    this._aspect = value;
  }

  get near(): number {
    return this._near;
  }

  set near(value: number) {
    this._near = value;
  }

  get far(): number {
    return this._far;
  }

  set far(value: number) {
    this._far = value;
  }

  get clipZ01(): boolean {
    return this._clipZ01;
  }

  set clipZ01(value: boolean) {
    this._clipZ01 = value;
  }

  static override fromArray(array: ArrayLike<number>): ProjectionMatrix {
    return new ProjectionMatrix(array, ProjectionMode.Perspective, (60 * Math.PI) / 180, 1, 0.1, 1000, false);
  }
}
