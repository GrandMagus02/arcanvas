import { Matrix4 } from "@arcanvas/math";
import { Transform } from "./Transform";
import { WorldVec3, cloneWorldVec3, copyWorldVec3, createWorldVec3 } from "./utils/WorldVec3";

/**
 * WorldTransform extends Transform to support double-precision world coordinates.
 *
 * This is the key to supporting "infinite" worlds:
 * - `worldPosition` stores the true position in double-precision (JS number)
 * - `localPosition` stores the position relative to the world origin (Float32)
 * - `_matrix` is computed from localPosition for GPU rendering
 */
export class WorldTransform extends Transform {
  private _worldPosition: WorldVec3;
  private _localPosition: Float32Array;
  private _rotation: Float32Array;
  private _scale: Float32Array;
  private _localDirty: boolean = true;

  constructor() {
    super();
    this._worldPosition = createWorldVec3(0, 0, 0);
    this._localPosition = new Float32Array(3);
    this._rotation = new Float32Array([0, 0, 0]);
    this._scale = new Float32Array([1, 1, 1]);
  }

  get worldPosition(): WorldVec3 {
    return cloneWorldVec3(this._worldPosition);
  }

  set worldPosition(value: WorldVec3 | { x: number; y: number; z: number }) {
    if (value instanceof WorldVec3) {
      this._worldPosition.x = value.x;
      this._worldPosition.y = value.y;
      this._worldPosition.z = value.z;
    } else {
      copyWorldVec3(this._worldPosition, value);
    }
    this._localDirty = true;
  }

  get worldPositionRef(): Readonly<WorldVec3> {
    return this._worldPosition;
  }

  setWorldPosition(x: number, y: number, z: number): this {
    this._worldPosition.x = x;
    this._worldPosition.y = y;
    this._worldPosition.z = z;
    this._localDirty = true;
    return this;
  }

  translateWorld(dx: number, dy: number, dz: number): this {
    this._worldPosition.x += dx;
    this._worldPosition.y += dy;
    this._worldPosition.z += dz;
    this._localDirty = true;
    return this;
  }

  get localPosition(): Float32Array {
    return this._localPosition;
  }

  get rotation(): Float32Array {
    return this._rotation;
  }

  setRotation(x: number, y: number, z: number): this {
    this._rotation[0] = x;
    this._rotation[1] = y;
    this._rotation[2] = z;
    this._localDirty = true;
    return this;
  }

  get scale(): Float32Array {
    return this._scale;
  }

  setScale(x: number, y: number, z: number): this {
    this._scale[0] = x;
    this._scale[1] = y;
    this._scale[2] = z;
    this._localDirty = true;
    return this;
  }

  setUniformScale(s: number): this {
    return this.setScale(s, s, s);
  }

  /**
   * Updates the local position from world position and the given origin.
   */
  updateLocal(origin: WorldVec3): void {
    this._localPosition[0] = this._worldPosition.x - origin.x;
    this._localPosition[1] = this._worldPosition.y - origin.y;
    this._localPosition[2] = this._worldPosition.z - origin.z;
    this._localDirty = true;
  }

  private _recomputeMatrix(): void {
    if (!this._localDirty) return;

    const rx = this._rotation[0]!;
    const ry = this._rotation[1]!;
    const rz = this._rotation[2]!;
    const sx = this._scale[0]!;
    const sy = this._scale[1]!;
    const sz = this._scale[2]!;

    const cx = Math.cos(rx),
      sx_ = Math.sin(rx);
    const cy = Math.cos(ry),
      sy_ = Math.sin(ry);
    const cz = Math.cos(rz),
      sz_ = Math.sin(rz);

    // Build rotation matrix (Rz * Ry * Rx order)
    const r00 = cy * cz;
    const r01 = sx_ * sy_ * cz - cx * sz_;
    const r02 = cx * sy_ * cz + sx_ * sz_;
    const r10 = cy * sz_;
    const r11 = sx_ * sy_ * sz_ + cx * cz;
    const r12 = cx * sy_ * sz_ - sx_ * cz;
    const r20 = -sy_;
    const r21 = sx_ * cy;
    const r22 = cx * cy;

    const data = this._matrix.data;
    // Column-major layout: column 0 at [0,1,2,3], column 1 at [4,5,6,7], etc.
    // Column 0: [r00*sx, r10*sx, r20*sx, 0]
    data[0] = r00 * sx;
    data[1] = r10 * sx;
    data[2] = r20 * sx;
    data[3] = 0;
    // Column 1: [r01*sy, r11*sy, r21*sy, 0]
    data[4] = r01 * sy;
    data[5] = r11 * sy;
    data[6] = r21 * sy;
    data[7] = 0;
    // Column 2: [r02*sz, r12*sz, r22*sz, 0]
    data[8] = r02 * sz;
    data[9] = r12 * sz;
    data[10] = r22 * sz;
    data[11] = 0;
    // Column 3: [tx, ty, tz, 1]
    data[12] = this._localPosition[0]!;
    data[13] = this._localPosition[1]!;
    data[14] = this._localPosition[2]!;
    data[15] = 1;

    this._localDirty = false;
  }

  override get modelMatrix(): Float32Array {
    this._recomputeMatrix();
    return super.modelMatrix;
  }

  override get matrix(): Matrix4 {
    this._recomputeMatrix();
    return this._matrix;
  }

  clone(): WorldTransform {
    const copy = new WorldTransform();
    copyWorldVec3(copy._worldPosition, this._worldPosition);
    copy._localPosition.set(this._localPosition);
    copy._rotation.set(this._rotation);
    copy._scale.set(this._scale);
    copy._localDirty = true;
    return copy;
  }
}
