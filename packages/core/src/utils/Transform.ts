import { Float64Matrix3x3 } from "@arcanvas/matrix";
import { Float64Vector3 } from "@arcanvas/vector";

/**
 * Transform is a class that represents a transform in 3D space.
 */
export class Transform {
  private _positionVec = new Float64Vector3(0, 0, 0);
  private _scaleVec = new Float64Vector3(1, 1, 1);
  private _rotationVec = new Float64Vector3(0, 0, 0);

  getLocalMatrix(): Float64Matrix3x3 {
    return new Float64Matrix3x3(1, 0, 0, 0, 1, 0, 0, 0, 1);
  }

  get position(): Float64Vector3 {
    return this._positionVec;
  }

  set position(value: Float64Vector3 | ArrayLike<number>) {
    if (value instanceof Float64Vector3) {
      this._positionVec = value;
    } else {
      this._positionVec = Float64Vector3.from(value);
    }
  }

  translate(x: number, y: number, z: number): this {
    this._positionVec.x = x;
    this._positionVec.y = y;
    this._positionVec.z = z;
    return this;
  }

  translateX(x: number): this {
    this._positionVec.x += x;
    return this;
  }

  translateY(y: number): this {
    this._positionVec.y += y;
    return this;
  }

  translateZ(z: number): this {
    this._positionVec.z += z;
    return this;
  }

  scale(x: number, y: number, z: number): this {
    this._scaleVec.x = x;
    this._scaleVec.y = y;
    this._scaleVec.z = z;
    return this;
  }

  scaleX(x: number): this {
    this._scaleVec.x += x;
    return this;
  }

  scaleY(y: number): this {
    this._scaleVec.y += y;
    return this;
  }

  scaleZ(z: number): this {
    this._scaleVec.z += z;
    return this;
  }

  rotate(x: number, y: number, z: number): this {
    this._rotationVec.x = x;
    this._rotationVec.y = y;
    this._rotationVec.z = z;
    return this;
  }

  rotateX(x: number): this {
    this._rotationVec.x += x;
    return this;
  }

  rotateY(y: number): this {
    this._rotationVec.y += y;
    return this;
  }

  rotateZ(z: number): this {
    this._rotationVec.z += z;
    return this;
  }
}
