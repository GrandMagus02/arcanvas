import { Matrix4 } from "@arcanvas/matrix";
import { MatrixOrientation } from "@arcanvas/matrix";
import { Vector } from "@arcanvas/vector";
import type { ProjectionMatrix } from "./ProjectionMatrix";
import type { ViewMatrix } from "./ViewMatrix";

/**
 * TransformationMatrix is a 4x4 matrix that represents a transformation in 3D space.
 */
export class TransformationMatrix extends Matrix4 {
  /**
   * Composes a view-projection matrix from projection and view matrices.
   * The result is projection * view (projection applied first, then view).
   * @param projection - The projection matrix
   * @param view - The view matrix
   * @returns A new TransformationMatrix representing the composed view-projection
   */
  static composeViewProjection(projection: ProjectionMatrix, view: ViewMatrix): TransformationMatrix {
    const result = projection.mult(view);
    return new TransformationMatrix(result.data as Float32Array);
  }

  /**
   * Converts the matrix to column-major order for WebGL uniformMatrix4fv.
   * WebGL expects matrices in column-major format.
   * @returns A Float32Array in column-major order
   */
  toColumnMajorArray(): Float32Array {
    // Matrix4 stores data in row-major order: [m00, m01, m02, m03, m10, m11, m12, m13, ...]
    // WebGL expects column-major: [m00, m10, m20, m30, m01, m11, m21, m31, ...]
    // So we transpose by reading column-wise instead of row-wise
    const result = new Float32Array(16);
    const data = this.data;
    // For a 4x4 matrix stored row-major, transpose to column-major
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        // Row-major index: r * 4 + c
        // Column-major index: c * 4 + r
        result[c * 4 + r] = data[r * 4 + c]!;
      }
    }
    return result;
  }
  get translationVec(): Vector<Float32Array, 3> {
    return new Vector<Float32Array, 3>(new Float32Array([this._data[3]!, this._data[7]!, this._data[11]!]));
  }

  get scaleVec(): Vector<Float32Array, 3> {
    return new Vector<Float32Array, 3>(new Float32Array([this._data[0]!, this._data[5]!, this._data[10]!]));
  }

  get rotationXVec(): Vector<Float32Array, 3> {
    return new Vector<Float32Array, 3>(new Float32Array([this._data[4]!, this._data[5]!, this._data[6]!]));
  }

  get rotationYVec(): Vector<Float32Array, 3> {
    return new Vector<Float32Array, 3>(new Float32Array([this._data[8]!, this._data[9]!, this._data[10]!]));
  }

  get rotationZVec(): Vector<Float32Array, 3> {
    return new Vector<Float32Array, 3>(new Float32Array([this._data[0]!, this._data[1]!, this._data[2]!]));
  }

  translate(x: number = 0, y: number = 0, z: number = 0): this {
    this._data[3] = this._data[3]! + x;
    this._data[7] = this._data[7]! + y;
    this._data[11] = this._data[11]! + z;
    return this;
  }
  translateX(x: number): this {
    return this.translate(x);
  }
  translateY(y: number): this {
    return this.translate(undefined, y);
  }
  translateZ(z: number): this {
    return this.translate(undefined, undefined, z);
  }

  scale(x: number = 1, y: number = 1, z: number = 1): this {
    this._data[0] = this._data[0]! * x;
    this._data[5] = this._data[5]! * y;
    this._data[10] = this._data[10]! * z;
    return this;
  }
  scaleX(x: number): this {
    return this.scale(x);
  }
  scaleY(y: number): this {
    return this.scale(undefined, y);
  }
  scaleZ(z: number): this {
    return this.scale(undefined, undefined, z);
  }

  rotateX(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this._data[4] = c;
    this._data[5] = -s;
    this._data[6] = s;
    this._data[7] = 0;
    return this;
  }
  rotateY(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this._data[8] = c;
    this._data[9] = -s;
    this._data[10] = s;
    this._data[11] = 0;
    return this;
  }
  rotateZ(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this._data[0] = c;
    this._data[1] = -s;
    this._data[2] = s;
    this._data[3] = 0;
    return this;
  }
}
