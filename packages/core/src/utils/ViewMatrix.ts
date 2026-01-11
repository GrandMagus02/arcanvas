import { Matrix4 } from "@arcanvas/matrix";
import { Vector3 } from "@arcanvas/vector";

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

    // Validate input vectors
    const eyeData = this._eye.data;
    const centerData = this._center.data;
    const upData = this._up.data;

    for (let i = 0; i < 3; i++) {
      if (!isFinite(eyeData[i]!)) {
        console.warn(`ViewMatrix: Invalid eye component at index ${i}, using 0`);
        eyeData[i] = 0;
      }
      if (!isFinite(centerData[i]!)) {
        console.warn(`ViewMatrix: Invalid center component at index ${i}, using 0`);
        centerData[i] = 0;
      }
      if (!isFinite(upData[i]!)) {
        console.warn(`ViewMatrix: Invalid up component at index ${i}, using ${i === 1 ? 1 : 0}`);
        upData[i] = i === 1 ? 1 : 0;
      }
    }

    // Calculate view direction
    // IMPORTANT: sub() modifies the original vector, so we must clone first to avoid corrupting _eye
    const eyeToCenter = this._eye.clone().sub(this._center);
    const eyeToCenterLen = Math.sqrt(
      eyeToCenter.data[0]! * eyeToCenter.data[0]! +
        eyeToCenter.data[1]! * eyeToCenter.data[1]! +
        eyeToCenter.data[2]! * eyeToCenter.data[2]!
    );

    // Handle case where eye and center are the same
    if (eyeToCenterLen < 1e-6) {
      console.warn("ViewMatrix: Eye and center are too close, using default view direction");
      const z = new Vector3(new Float32Array([0, 0, 1]));
      const x = this._up.cross(z).normalize();
      const y = z.cross(x).normalize();

      this._data[0] = x.data[0]!;
      this._data[1] = y.data[0]!;
      this._data[2] = z.data[0]!;
      this._data[3] = 0;
      this._data[4] = x.data[1]!;
      this._data[5] = y.data[1]!;
      this._data[6] = z.data[1]!;
      this._data[7] = 0;
      this._data[8] = x.data[2]!;
      this._data[9] = y.data[2]!;
      this._data[10] = z.data[2]!;
      this._data[11] = 0;
      this._data[12] = -x.dot(this._eye);
      this._data[13] = -y.dot(this._eye);
      this._data[14] = -z.dot(this._eye);
      this._data[15] = 1;
      return;
    }

    const z = eyeToCenter.normalize();
    const x = this._up.cross(z);
    const xLen = Math.sqrt(x.data[0]! * x.data[0]! + x.data[1]! * x.data[1]! + x.data[2]! * x.data[2]!);

    // Handle case where up and view direction are parallel
    if (xLen < 1e-6) {
      console.warn("ViewMatrix: Up vector is parallel to view direction, using alternative");
      const altUp = new Vector3(new Float32Array([0, 0, 1]));
      const altX = altUp.cross(z).normalize();
      const altY = z.cross(altX).normalize();

      this._data[0] = altX.data[0]!;
      this._data[1] = altY.data[0]!;
      this._data[2] = z.data[0]!;
      this._data[3] = 0;
      this._data[4] = altX.data[1]!;
      this._data[5] = altY.data[1]!;
      this._data[6] = z.data[1]!;
      this._data[7] = 0;
      this._data[8] = altX.data[2]!;
      this._data[9] = altY.data[2]!;
      this._data[10] = z.data[2]!;
      this._data[11] = 0;
      this._data[12] = -altX.dot(this._eye);
      this._data[13] = -altY.dot(this._eye);
      this._data[14] = -z.dot(this._eye);
      this._data[15] = 1;
      return;
    }

    const xNorm = x.normalize();
    const y = z.cross(xNorm).normalize();

    // Validate matrix values before assignment
    const matrixValues = [
      xNorm.data[0]!,
      y.data[0]!,
      z.data[0]!,
      xNorm.data[1]!,
      y.data[1]!,
      z.data[1]!,
      xNorm.data[2]!,
      y.data[2]!,
      z.data[2]!,
      -xNorm.dot(this._eye),
      -y.dot(this._eye),
      -z.dot(this._eye),
    ];

    for (let i = 0; i < matrixValues.length; i++) {
      if (!isFinite(matrixValues[i]!)) {
        console.error(`ViewMatrix: Invalid matrix value at index ${i}, matrix update failed`);
        console.error(`ViewMatrix: xNorm: [${xNorm.data[0]}, ${xNorm.data[1]}, ${xNorm.data[2]}], y: [${y.data[0]}, ${y.data[1]}, ${y.data[2]}], z: [${z.data[0]}, ${z.data[1]}, ${z.data[2]}]`);
        console.error(`ViewMatrix: eye: [${this._eye.data[0]}, ${this._eye.data[1]}, ${this._eye.data[2]}], center: [${this._center.data[0]}, ${this._center.data[1]}, ${this._center.data[2]}]`);
        // Don't return early - try to fix invalid values or use fallback
        // Set invalid values to 0 to prevent NaN/Infinity propagation
        if (i < 9) {
          // Position/rotation part - set to identity-like values
          matrixValues[i] = i % 4 === 0 ? 1 : 0; // Diagonal elements to 1, others to 0
        } else {
          // Translation part - set to 0
          matrixValues[i] = 0;
        }
      }
    }

    this._data[0] = xNorm.data[0]!;
    this._data[1] = y.data[0]!;
    this._data[2] = z.data[0]!;
    this._data[3] = 0;
    this._data[4] = xNorm.data[1]!;
    this._data[5] = y.data[1]!;
    this._data[6] = z.data[1]!;
    this._data[7] = 0;
    this._data[8] = xNorm.data[2]!;
    this._data[9] = y.data[2]!;
    this._data[10] = z.data[2]!;
    this._data[11] = 0;
    this._data[12] = -xNorm.dot(this._eye);
    this._data[13] = -y.dot(this._eye);
    this._data[14] = -z.dot(this._eye);
    this._data[15] = 1;
    
    // Final validation - ensure no NaN/Infinity values
    for (let i = 0; i < 16; i++) {
      if (!isFinite(this._data[i]!)) {
        console.error(`ViewMatrix: Matrix still has invalid value at index ${i} after update, setting to identity`);
        // Fallback to identity if still invalid
        const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        for (let j = 0; j < 16; j++) {
          this._data[j] = identity[j]!;
        }
        break;
      }
    }
  }
}
