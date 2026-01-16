import { Matrix4 } from "@arcanvas/matrix";
import { MatrixOrientation } from "@arcanvas/matrix";
import { Vector } from "@arcanvas/vector";

/**
 * TransformationMatrix is a 4x4 matrix that represents a transformation in 3D space.
 */
export class TransformationMatrix extends Matrix4 {
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
    // Rotation around X-axis:
    // [1   0    0   0]
    // [0   c   -s   0]
    // [0   s    c   0]
    // [0   0    0   1]
    // Row-major indices: row 1 at [4,5,6,7], row 2 at [8,9,10,11]
    this._data[5] = c;
    this._data[6] = -s;
    this._data[9] = s;
    this._data[10] = c;
    // Preserve translation Y at [7] and translation Z at [11]
    return this;
  }
  rotateY(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // Rotation around Y-axis:
    // [c   0   s   0]
    // [0   1   0   0]
    // [-s  0   c   0]
    // [0   0   0   1]
    // Row-major indices: row 0 at [0,1,2,3], row 2 at [8,9,10,11]
    this._data[0] = c;
    this._data[2] = s;
    this._data[8] = -s;
    this._data[10] = c;
    // Preserve translation X at [3] and translation Z at [11]
    return this;
  }
  rotateZ(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // Rotation around Z-axis:
    // [c  -s   0   0]
    // [s   c   0   0]
    // [0   0   1   0]
    // [0   0   0   1]
    // Row-major indices: row 0 at [0,1,2,3], row 1 at [4,5,6,7]
    this._data[0] = c;
    this._data[1] = -s;
    this._data[4] = s;
    this._data[5] = c;
    // Preserve translation X at [3] and translation Y at [7]
    return this;
  }

  /**
   * Returns the inverse of this matrix.
   * @returns A new TransformationMatrix that is the inverse of this matrix.
   */
  invert(): TransformationMatrix {
    // Simple 4x4 matrix inversion using adjugate method
    const m = this._data;
    const inv = new Float32Array(16);

    inv[0] = m[5]! * m[10]! * m[15]! - m[5]! * m[11]! * m[14]! - m[9]! * m[6]! * m[15]! + m[9]! * m[7]! * m[14]! + m[13]! * m[6]! * m[11]! - m[13]! * m[7]! * m[10]!;
    inv[4] = -m[4]! * m[10]! * m[15]! + m[4]! * m[11]! * m[14]! + m[8]! * m[6]! * m[15]! - m[8]! * m[7]! * m[14]! - m[12]! * m[6]! * m[11]! + m[12]! * m[7]! * m[10]!;
    inv[8] = m[4]! * m[9]! * m[15]! - m[4]! * m[11]! * m[13]! - m[8]! * m[5]! * m[15]! + m[8]! * m[7]! * m[13]! + m[12]! * m[5]! * m[11]! - m[12]! * m[7]! * m[9]!;
    inv[12] = -m[4]! * m[9]! * m[14]! + m[4]! * m[10]! * m[13]! + m[8]! * m[5]! * m[14]! - m[8]! * m[6]! * m[13]! - m[12]! * m[5]! * m[10]! + m[12]! * m[6]! * m[9]!;

    inv[1] = -m[1]! * m[10]! * m[15]! + m[1]! * m[11]! * m[14]! + m[9]! * m[2]! * m[15]! - m[9]! * m[3]! * m[14]! - m[13]! * m[2]! * m[11]! + m[13]! * m[3]! * m[10]!;
    inv[5] = m[0]! * m[10]! * m[15]! - m[0]! * m[11]! * m[14]! - m[8]! * m[2]! * m[15]! + m[8]! * m[3]! * m[14]! + m[12]! * m[2]! * m[11]! - m[12]! * m[3]! * m[10]!;
    inv[9] = -m[0]! * m[9]! * m[15]! + m[0]! * m[11]! * m[13]! + m[8]! * m[1]! * m[15]! - m[8]! * m[3]! * m[13]! - m[12]! * m[1]! * m[11]! + m[12]! * m[3]! * m[9]!;
    inv[13] = m[0]! * m[9]! * m[14]! - m[0]! * m[10]! * m[13]! - m[8]! * m[1]! * m[14]! + m[8]! * m[2]! * m[13]! + m[12]! * m[1]! * m[10]! - m[12]! * m[2]! * m[9]!;

    inv[2] = m[1]! * m[6]! * m[15]! - m[1]! * m[7]! * m[14]! - m[5]! * m[2]! * m[15]! + m[5]! * m[3]! * m[14]! + m[13]! * m[2]! * m[7]! - m[13]! * m[3]! * m[6]!;
    inv[6] = -m[0]! * m[6]! * m[15]! + m[0]! * m[7]! * m[14]! + m[4]! * m[2]! * m[15]! - m[4]! * m[3]! * m[14]! - m[12]! * m[2]! * m[7]! + m[12]! * m[3]! * m[6]!;
    inv[10] = m[0]! * m[5]! * m[15]! - m[0]! * m[7]! * m[13]! - m[4]! * m[1]! * m[15]! + m[4]! * m[3]! * m[13]! + m[12]! * m[1]! * m[7]! - m[12]! * m[3]! * m[5]!;
    inv[14] = -m[0]! * m[5]! * m[14]! + m[0]! * m[6]! * m[13]! + m[4]! * m[1]! * m[14]! - m[4]! * m[2]! * m[13]! - m[12]! * m[1]! * m[6]! + m[12]! * m[2]! * m[5]!;

    inv[3] = -m[1]! * m[6]! * m[11]! + m[1]! * m[7]! * m[10]! + m[5]! * m[2]! * m[11]! - m[5]! * m[3]! * m[10]! - m[9]! * m[2]! * m[7]! + m[9]! * m[3]! * m[6]!;
    inv[7] = m[0]! * m[6]! * m[11]! - m[0]! * m[7]! * m[10]! - m[4]! * m[2]! * m[11]! + m[4]! * m[3]! * m[10]! + m[8]! * m[2]! * m[7]! - m[8]! * m[3]! * m[6]!;
    inv[11] = -m[0]! * m[5]! * m[11]! + m[0]! * m[7]! * m[9]! + m[4]! * m[1]! * m[11]! - m[4]! * m[3]! * m[9]! - m[8]! * m[1]! * m[7]! + m[8]! * m[3]! * m[5]!;
    inv[15] = m[0]! * m[5]! * m[10]! - m[0]! * m[6]! * m[9]! - m[4]! * m[1]! * m[10]! + m[4]! * m[2]! * m[9]! + m[8]! * m[1]! * m[6]! - m[8]! * m[2]! * m[5]!;

    let det = m[0]! * inv[0] + m[1]! * inv[4] + m[2]! * inv[8] + m[3]! * inv[12];

    if (det === 0) {
      throw new Error("Matrix is not invertible");
    }

    det = 1.0 / det;
    for (let i = 0; i < 16; i++) {
      inv[i] = inv[i]! * det;
    }

    return new TransformationMatrix(inv);
  }

  /**
   * Returns the matrix as a column-major Float32Array for WebGL.
   * @returns A Float32Array in column-major order.
   */
  toColumnMajorArray(): Float32Array {
    return this.toFloat32Array(MatrixOrientation.ColumnMajor);
  }
}
