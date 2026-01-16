import { TransformationMatrix } from "../utils/TransformationMatrix";

const IDENTITY_4X4 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/**
 * Minimal transform wrapper for render objects.
 */
export class Transform {
  private _matrix: TransformationMatrix;

  constructor(matrix?: TransformationMatrix) {
    this._matrix = matrix ?? new TransformationMatrix(new Float32Array(IDENTITY_4X4));
  }

  get matrix(): TransformationMatrix {
    return this._matrix;
  }

  set matrix(value: TransformationMatrix) {
    this._matrix = value;
  }

  get modelMatrix(): Float32Array {
    return this._matrix.toColumnMajorArray();
  }
}
