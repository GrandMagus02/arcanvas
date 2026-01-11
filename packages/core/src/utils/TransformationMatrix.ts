import { Matrix4 } from "@arcanvas/matrix";
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
    // Validate input matrices before composition
    const projData = projection.data;
    const viewData = view.data;

    for (let i = 0; i < 16; i++) {
      if (!isFinite(projData[i]!)) {
        console.error(`TransformationMatrix.composeViewProjection: Projection matrix has invalid value at index ${i}:`, projData[i]);
        throw new Error(`Invalid projection matrix at index ${i}`);
      }
      if (!isFinite(viewData[i]!)) {
        console.error(`TransformationMatrix.composeViewProjection: View matrix has invalid value at index ${i}:`, viewData[i]);
        throw new Error(`Invalid view matrix at index ${i}`);
      }
    }

    const result = projection.mult(view);
    const resultData = result.data;

    // Validate result
    for (let i = 0; i < 16; i++) {
      if (!isFinite(resultData[i]!)) {
        console.error(`TransformationMatrix.composeViewProjection: Result matrix has invalid value at index ${i}:`, resultData[i]);
        throw new Error(`Invalid view-projection matrix at index ${i}`);
      }
    }

    return new TransformationMatrix(resultData);
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

  /**
   * Inverts this 4x4 matrix using Gauss-Jordan elimination.
   * @returns A new TransformationMatrix representing the inverse
   * @throws Error if the matrix is singular (not invertible)
   */
  invert(): TransformationMatrix {
    // Create augmented matrix [M | I]
    const aug = new Float32Array(16 * 2); // 4 rows, 8 columns (original + identity)
    const data = this.data;

    // Copy original matrix to left side
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        aug[r * 8 + c] = data[r * 4 + c]!;
      }
    }

    // Copy identity matrix to right side
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        aug[r * 8 + 4 + c] = r === c ? 1 : 0;
      }
    }

    // Gauss-Jordan elimination
    for (let pivot = 0; pivot < 4; pivot++) {
      // Find the row with the largest absolute value in the pivot column
      let maxRow = pivot;
      let maxVal = Math.abs(aug[pivot * 8 + pivot]!);
      for (let r = pivot + 1; r < 4; r++) {
        const val = Math.abs(aug[r * 8 + pivot]!);
        if (val > maxVal) {
          maxVal = val;
          maxRow = r;
        }
      }

      // Swap rows if needed
      if (maxRow !== pivot) {
        for (let c = 0; c < 8; c++) {
          const temp = aug[pivot * 8 + c]!;
          aug[pivot * 8 + c] = aug[maxRow * 8 + c]!;
          aug[maxRow * 8 + c] = temp;
        }
      }

      // Check for singularity
      const pivotVal = aug[pivot * 8 + pivot]!;
      if (Math.abs(pivotVal) < 1e-10) {
        throw new Error("Matrix is singular and cannot be inverted");
      }

      // Normalize pivot row
      const invPivot = 1.0 / pivotVal;
      for (let c = 0; c < 8; c++) {
        aug[pivot * 8 + c] = aug[pivot * 8 + c]! * invPivot;
      }

      // Eliminate column
      for (let r = 0; r < 4; r++) {
        if (r !== pivot) {
          const factor = aug[r * 8 + pivot]!;
          for (let c = 0; c < 8; c++) {
            aug[r * 8 + c] = aug[r * 8 + c]! - factor * aug[pivot * 8 + c]!;
          }
        }
      }
    }

    // Extract inverse matrix from right side
    const invData = new Float32Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        invData[r * 4 + c] = aug[r * 8 + 4 + c]!;
      }
    }

    return new TransformationMatrix(invData);
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
