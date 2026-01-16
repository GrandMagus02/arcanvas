import { Matrix4 } from "@arcanvas/math";

const IDENTITY_4X4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/**
 * Minimal transform wrapper for render objects.
 * Provides a 4x4 transformation matrix for positioning objects in 3D space.
 */
export class Transform {
  protected _matrix: Matrix4;

  constructor(matrix?: Matrix4) {
    this._matrix = matrix ?? new Matrix4(new Float32Array(IDENTITY_4X4));
  }

  get matrix(): Matrix4 {
    return this._matrix;
  }

  set matrix(value: Matrix4) {
    this._matrix = value;
  }

  /**
   * Returns the model matrix in column-major order (for WebGL).
   */
  get modelMatrix(): Float32Array {
    // Transpose row-major to column-major for WebGL
    const data = this._matrix.data;
    return new Float32Array([
      data[0]!,
      data[4]!,
      data[8]!,
      data[12]!,
      data[1]!,
      data[5]!,
      data[9]!,
      data[13]!,
      data[2]!,
      data[6]!,
      data[10]!,
      data[14]!,
      data[3]!,
      data[7]!,
      data[11]!,
      data[15]!,
    ]);
  }
}
