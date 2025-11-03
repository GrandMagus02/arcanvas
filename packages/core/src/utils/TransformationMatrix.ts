import { Float32Matrix4x4 } from "@arcanvas/matrix";
import { Float64Vector3 } from "@arcanvas/vector";

/**
 * TransformationMatrix is a 4x4 matrix that represents a transformation in 3D space.
 */
export class TransformationMatrix extends Float32Matrix4x4 {
  constructor(
    a11: number = 1,
    a12: number = 0,
    a13: number = 0,
    a14: number = 0,
    a21: number = 0,
    a22: number = 1,
    a23: number = 0,
    a24: number = 0,
    a31: number = 0,
    a32: number = 0,
    a33: number = 1,
    a34: number = 0,
    a41: number = 0,
    a42: number = 0,
    a43: number = 0,
    a44: number = 1
  ) {
    super(a11, a12, a13, a14, a21, a22, a23, a24, a31, a32, a33, a34, a41, a42, a43, a44);
  }

  get translationVec(): Float64Vector3 {
    return new Float64Vector3(this.a14, this.a24, this.a34);
  }

  get scaleVec(): Float64Vector3 {
    return new Float64Vector3(this.a11, this.a22, this.a33);
  }

  get rotationXVec(): Float64Vector3 {
    return new Float64Vector3(this.a21, this.a22, this.a23);
  }

  get rotationYVec(): Float64Vector3 {
    return new Float64Vector3(this.a31, this.a32, this.a33);
  }

  get rotationZVec(): Float64Vector3 {
    return new Float64Vector3(this.a11, this.a12, this.a13);
  }

  translate(x: number, y: number, z: number): this {
    this.a14 += x;
    this.a24 += y;
    this.a34 += z;
    return this;
  }
  translateX(x: number): this {
    this.a14 += x;
    return this;
  }
  translateY(y: number): this {
    this.a24 += y;
    return this;
  }
  translateZ(z: number): this {
    this.a34 += z;
    return this;
  }

  scale(x: number, y: number, z: number): this {
    this.a11 *= x;
    this.a22 *= y;
    this.a33 *= z;
    return this;
  }
  scaleX(x: number): this {
    this.a11 *= x;
    return this;
  }
  scaleY(y: number): this {
    this.a22 *= y;
    return this;
  }
  scaleZ(z: number): this {
    this.a33 *= z;
    return this;
  }

  rotateX(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.a21 = c;
    this.a22 = -s;
    this.a23 = s;
    this.a24 = 0;
    return this;
  }
  rotateY(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.a31 = c;
    this.a32 = -s;
    this.a33 = s;
    this.a34 = 0;
    return this;
  }
  rotateZ(rad: number): this {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.a11 = c;
    this.a12 = -s;
    this.a13 = s;
    this.a14 = 0;
    return this;
  }
  rotate(rx: number, ry: number, rz: number): this {
    return this.rotateZ(rz).rotateY(ry).rotateX(rx);
  }

  lookTo(eyeX: number, eyeY: number, eyeZ: number, dirX: number, dirY: number, dirZ: number, upX = 0, upY = 1, upZ = 0): number[] {
    // Normalize dir
    const dl = Math.hypot(dirX, dirY, dirZ) || 1;
    const zx = dirX / dl;
    const zy = dirY / dl;
    const zz = dirZ / dl;

    // Right = normalize(up × dir)
    const rx = upY * zz - upZ * zy;
    const ry = upZ * zx - upX * zz;
    const rz = upX * zy - upY * zx;
    const rl = Math.hypot(rx, ry, rz) || 1;
    const x = rx / rl;
    const y = ry / rl;
    const z = rz / rl;

    // Recompute Up = dir × right
    const ux = zy * z - zz * y;
    const uy = zz * x - zx * z;
    const uz = zx * y - zy * x;

    // Row-major view (R, U, -D) and translation -dot(R, eye) etc.
    const tx = -(x * eyeX + y * eyeY + z * eyeZ);
    const ty = -(ux * eyeX + uy * eyeY + uz * eyeZ);
    const tz = +(zx * eyeX + zy * eyeY + zz * eyeZ) * -1; // since we used -D in rows

    // Using rows: [R; U; -D]
    return [x, y, z, tx, ux, uy, uz, ty, -zx, -zy, -zz, tz, 0, 0, 0, 1];
  }

  // Projections

  // Orthographic. clipZ01 = true for D3D/Vulkan [0,1], false for OpenGL [-1,1]
  static makeOrtho(left: number, right: number, bottom: number, top: number, near: number, far: number, clipZ01 = false): number[] {
    const sx = 2 / (right - left);
    const sy = 2 / (top - bottom);
    const tx = -(right + left) / (right - left);
    const ty = -(top + bottom) / (top - bottom);

    if (clipZ01) {
      const sz = 1 / (far - near);
      const tz = -near / (far - near);
      return [sx, 0, 0, tx, 0, sy, 0, ty, 0, 0, sz, tz, 0, 0, 0, 1];
    } else {
      const sz = -2 / (far - near);
      const tz = -(far + near) / (far - near);
      return [sx, 0, 0, tx, 0, sy, 0, ty, 0, 0, sz, tz, 0, 0, 0, 1];
    }
  }

  // Perspective from vertical FOV. clipZ01 = true for D3D/Vulkan [0,1], false for OpenGL [-1,1]
  static makePerspectiveFov(fovY: number, aspect: number, near: number, far: number, clipZ01 = false): number[] {
    const s = 1 / Math.tan(fovY * 0.5);
    const sx = s / aspect;
    if (clipZ01) {
      // D3D/Vulkan
      return [sx, 0, 0, 0, 0, s, 0, 0, 0, 0, far / (far - near), (-near * far) / (far - near), 0, 0, 1, 0];
    } else {
      // OpenGL
      return [sx, 0, 0, 0, 0, s, 0, 0, 0, 0, -(far + near) / (far - near), (-2 * near * far) / (far - near), 0, 0, -1, 0];
    }
  }
}
