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
   * Matrix is stored internally in column-major order, so we can return it directly.
   */
  get modelMatrix(): Float32Array {
    return this._matrix.toFloat32Array(); // Already in column-major order for WebGL
  }
}
