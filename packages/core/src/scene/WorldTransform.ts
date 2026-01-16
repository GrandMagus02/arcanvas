import { TransformationMatrix } from "../utils/TransformationMatrix";
import { WorldVec3, createWorldVec3, copyWorldVec3, cloneWorldVec3 } from "../utils/world/WorldVec3";
import { Transform } from "./Transform";

/**
 * WorldTransform extends Transform to support double-precision world coordinates.
 *
 * This is the key to supporting "infinite" worlds:
 * - `worldPosition` stores the true position in double-precision (JS number)
 * - `localPosition` stores the position relative to the world origin (Float32)
 * - `_matrix` is computed from localPosition for GPU rendering
 *
 * Workflow:
 * 1. Set `worldPosition` to the object's true position
 * 2. Call `updateLocal(origin)` with the current world origin
 * 3. `localPosition` and `modelMatrix` are now ready for rendering
 *
 * For rotation and scale, we continue to use the existing matrix-based approach
 * since these don't suffer from precision issues like translation.
 */
export class WorldTransform extends Transform {
  /**
   * World-space position in double precision.
   * This is the "true" position in the universe.
   */
  private _worldPosition: WorldVec3;

  /**
   * Local position relative to the world origin.
   * This is computed from worldPosition and should be small enough for Float32.
   */
  private _localPosition: Float32Array;

  /**
   * Rotation in radians (Euler angles).
   * Stored separately for easier manipulation.
   */
  private _rotation: Float32Array;

  /**
   * Scale factors.
   */
  private _scale: Float32Array;

  /**
   * Whether the local matrix needs to be recomputed.
   */
  private _localDirty: boolean = true;

  constructor() {
    super();
    this._worldPosition = createWorldVec3(0, 0, 0);
    this._localPosition = new Float32Array(3);
    this._rotation = new Float32Array([0, 0, 0]);
    this._scale = new Float32Array([1, 1, 1]);
  }

  /**
   * Gets the world-space position (double precision).
   */
  get worldPosition(): WorldVec3 {
    return cloneWorldVec3(this._worldPosition);
  }

  /**
   * Sets the world-space position.
   * Note: You must call updateLocal() after changing this for rendering.
   */
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

  /**
   * Gets a reference to the world position (avoid allocation in tight loops).
   * DO NOT MODIFY the returned object directly!
   */
  get worldPositionRef(): Readonly<WorldVec3> {
    return this._worldPosition;
  }

  /**
   * Sets world position by components.
   */
  setWorldPosition(x: number, y: number, z: number): this {
    this._worldPosition.x = x;
    this._worldPosition.y = y;
    this._worldPosition.z = z;
    this._localDirty = true;
    return this;
  }

  /**
   * Translates the world position by the given delta.
   */
  translateWorld(dx: number, dy: number, dz: number): this {
    this._worldPosition.x += dx;
    this._worldPosition.y += dy;
    this._worldPosition.z += dz;
    this._localDirty = true;
    return this;
  }

  /**
   * Gets the local position (relative to world origin).
   */
  get localPosition(): Float32Array {
    return this._localPosition;
  }

  /**
   * Gets rotation in radians (Euler angles XYZ).
   */
  get rotation(): Float32Array {
    return this._rotation;
  }

  /**
   * Sets rotation from Euler angles.
   */
  setRotation(x: number, y: number, z: number): this {
    this._rotation[0] = x;
    this._rotation[1] = y;
    this._rotation[2] = z;
    this._localDirty = true;
    return this;
  }

  /**
   * Gets scale factors.
   */
  get scale(): Float32Array {
    return this._scale;
  }

  /**
   * Sets scale factors.
   */
  setScale(x: number, y: number, z: number): this {
    this._scale[0] = x;
    this._scale[1] = y;
    this._scale[2] = z;
    this._localDirty = true;
    return this;
  }

  /**
   * Sets uniform scale.
   */
  setUniformScale(s: number): this {
    return this.setScale(s, s, s);
  }

  /**
   * Updates the local position from world position and the given origin.
   * This MUST be called before rendering when the world origin changes.
   *
   * @param origin The current world origin (typically from WorldOrigin.originRef)
   */
  updateLocal(origin: WorldVec3): void {
    // Compute local = world - origin
    this._localPosition[0] = this._worldPosition.x - origin.x;
    this._localPosition[1] = this._worldPosition.y - origin.y;
    this._localPosition[2] = this._worldPosition.z - origin.z;

    this._localDirty = true;
  }

  /**
   * Recomputes the model matrix from local position, rotation, and scale.
   * The matrix is stored in row-major order as per @arcanvas/matrix convention.
   */
  private _recomputeMatrix(): void {
    if (!this._localDirty) return;

    const rx = this._rotation[0]!;
    const ry = this._rotation[1]!;
    const rz = this._rotation[2]!;
    const sx = this._scale[0]!;
    const sy = this._scale[1]!;
    const sz = this._scale[2]!;

    // Precompute trig
    const cx = Math.cos(rx),
      sx_ = Math.sin(rx);
    const cy = Math.cos(ry),
      sy_ = Math.sin(ry);
    const cz = Math.cos(rz),
      sz_ = Math.sin(rz);

    // Build rotation matrix (Rz * Ry * Rx order)
    // Then scale and translate
    // Row-major layout:
    // [ r00*sx  r01*sy  r02*sz  tx ]
    // [ r10*sx  r11*sy  r12*sz  ty ]
    // [ r20*sx  r21*sy  r22*sz  tz ]
    // [   0       0       0      1 ]

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
    data[0] = r00 * sx;
    data[1] = r01 * sy;
    data[2] = r02 * sz;
    data[3] = this._localPosition[0]!;
    data[4] = r10 * sx;
    data[5] = r11 * sy;
    data[6] = r12 * sz;
    data[7] = this._localPosition[1]!;
    data[8] = r20 * sx;
    data[9] = r21 * sy;
    data[10] = r22 * sz;
    data[11] = this._localPosition[2]!;
    data[12] = 0;
    data[13] = 0;
    data[14] = 0;
    data[15] = 1;

    this._localDirty = false;
  }

  /**
   * Gets the model matrix, recomputing if necessary.
   * Returns column-major Float32Array for WebGL.
   */
  override get modelMatrix(): Float32Array {
    this._recomputeMatrix();
    return super.modelMatrix;
  }

  /**
   * Gets the transformation matrix.
   * Forces recomputation if dirty.
   */
  override get matrix(): TransformationMatrix {
    this._recomputeMatrix();
    return this._matrix;
  }

  /**
   * Creates a copy of this transform.
   */
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
