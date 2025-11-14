import { Matrix4 } from "@arcanvas/matrix";
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
