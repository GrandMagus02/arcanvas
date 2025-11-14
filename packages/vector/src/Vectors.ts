import type { NumberArray } from "./types";
import { Vector } from "./Vector";

/**
 * Vector2 is a 2D vector of 32-bit floating point numbers.
 */
export class Vector2<T extends NumberArray = Float32Array> extends Vector<T, 2> {
  constructor(data: T = new Float32Array([0, 0]) as T) {
    super(data, 2);
  }

  get x(): number {
    return this._data[0]!;
  }
  set x(value: number) {
    this._data[0] = value;
  }

  get y(): number {
    return this._data[1]!;
  }
  set y(value: number) {
    this._data[1] = value;
  }
}

/**
 * Vector3 is a 3D vector of 32-bit floating point numbers.
 */
export class Vector3<T extends NumberArray = Float32Array> extends Vector<T, 3> {
  constructor(data: T = new Float32Array([0, 0, 0]) as T) {
    super(data, 3);
  }

  get x(): number {
    return this._data[0]!;
  }
  set x(value: number) {
    this._data[0] = value;
  }

  get y(): number {
    return this._data[1]!;
  }
  set y(value: number) {
    this._data[1] = value;
  }

  get z(): number {
    return this._data[2]!;
  }
  set z(value: number) {
    this._data[2] = value;
  }
}

/**
 * Vector4 is a 4D vector of 32-bit floating point numbers.
 */
export class Vector4<T extends NumberArray = Float32Array> extends Vector<T, 4> {
  constructor(data: T = new Float32Array([0, 0, 0, 0]) as T) {
    super(data, 4);
  }

  get x(): number {
    return this._data[0]!;
  }
  set x(value: number) {
    this._data[0] = value;
  }

  get y(): number {
    return this._data[1]!;
  }
  set y(value: number) {
    this._data[1] = value;
  }

  get z(): number {
    return this._data[2]!;
  }
  set z(value: number) {
    this._data[2] = value;
  }

  get w(): number {
    return this._data[3]!;
  }
  set w(value: number) {
    this._data[3] = value;
  }
}
