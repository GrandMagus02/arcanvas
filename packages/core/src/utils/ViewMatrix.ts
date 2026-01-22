import { Matrix4, Vector3 } from "@arcanvas/math";

/**
 * ViewMatrix is a 4x4 matrix that represents a view in 3D space.
 * @param eye - The eye position.
 * @param center - The center position.
 * @param up - The up vector.
 * @returns {ViewMatrix}
 * @example
 * ```ts
 * const view = new ViewMatrix(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 1, 0));
 * console.log(view.eye); // Vector3(0, 0, 0)
 * console.log(view.center); // Vector3(0, 0, 0)
 * console.log(view.up); // Vector3(0, 1, 0)
 * ```
 */
export class ViewMatrix extends Matrix4 {
  protected _eye: Vector3;
  protected _center: Vector3;
  protected _up: Vector3;

  constructor(eye: Vector3 = new Vector3(new Float32Array([0, 0, 0])), center: Vector3 = new Vector3(new Float32Array([0, 0, 0])), up: Vector3 = new Vector3(new Float32Array([0, 1, 0]))) {
    super();
    this._eye = eye.clone();
    this._center = center.clone();
    this._up = up.clone();
    this.update();
  }

  get eye(): Vector3 {
    return this._eye.clone();
  }

  get center(): Vector3 {
    return this._center.clone();
  }

  get up(): Vector3 {
    return this._up.clone();
  }

  set eye(value: Vector3) {
    this.update(value, undefined, undefined);
  }

  set center(value: Vector3) {
    this.update(undefined, value, undefined);
  }

  set up(value: Vector3) {
    this.update(undefined, undefined, value);
  }

  update(eye?: Vector3, center?: Vector3, up?: Vector3): void {
    if (eye) {
      this._eye = eye.clone();
    }
    if (center) {
      this._center = center.clone();
    }
    if (up) {
      this._up = up.clone();
    }

    // Check if eye and center are the same (2D camera case)
    // Use clones to avoid mutating original vectors
    const eyeClone = this._eye.clone();
    const centerClone = this._center.clone();
    const eyeCenterDiff = eyeClone.sub(centerClone);
    const diffLength = eyeCenterDiff.length;

    // If eye and center are the same or very close, use simple translation matrix for 2D.
    // IMPORTANT: Matrices in @arcanvas/matrix are stored row-major.
    // Translation lives in the last column: indices 3, 7, 11.
    if (diffLength < 0.0001) {
      this._data[0] = 1;
      this._data[1] = 0;
      this._data[2] = 0;
      this._data[3] = -this._eye.x;
      this._data[4] = 0;
      this._data[5] = 1;
      this._data[6] = 0;
      this._data[7] = -this._eye.y;
      this._data[8] = 0;
      this._data[9] = 0;
      this._data[10] = 1;
      this._data[11] = -this._eye.z;
      this._data[12] = 0;
      this._data[13] = 0;
      this._data[14] = 0;
      this._data[15] = 1;
      return;
    }

    // 3D look-at matrix calculation
    const z = eyeCenterDiff.normalize();
    const x = this._up.cross(z).normalize();
    const y = z.cross(x).normalize();

    // Row-major view matrix:
    // [ x0 x1 x2 -dot(x,eye) ]
    // [ y0 y1 y2 -dot(y,eye) ]
    // [ z0 z1 z2 -dot(z,eye) ]
    // [  0  0  0      1      ]
    this._data[0] = x.data[0]!;
    this._data[1] = x.data[1]!;
    this._data[2] = x.data[2]!;
    this._data[3] = -x.dot(this._eye);
    this._data[4] = y.data[0]!;
    this._data[5] = y.data[1]!;
    this._data[6] = y.data[2]!;
    this._data[7] = -y.dot(this._eye);
    this._data[8] = z.data[0]!;
    this._data[9] = z.data[1]!;
    this._data[10] = z.data[2]!;
    this._data[11] = -z.dot(this._eye);
    this._data[12] = 0;
    this._data[13] = 0;
    this._data[14] = 0;
    this._data[15] = 1;
  }
}
