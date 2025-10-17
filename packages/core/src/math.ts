export type Vec3 = Float32Array; // length 3
export type Mat4 = Float32Array; // length 16, column-major

export function createVec3(x = 0, y = 0, z = 0): Vec3 {
  const v = new Float32Array(3);
  v[0] = x;
  v[1] = y;
  v[2] = z;
  return v;
}

export function setVec3(out: Vec3, x: number, y: number, z: number): Vec3 {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}

export function copyVec3(out: Vec3, a: Vec3): Vec3 {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}

export function addVec3(out: Vec3, a: Vec3, b: Vec3): Vec3 {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}

export function subVec3(out: Vec3, a: Vec3, b: Vec3): Vec3 {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}

export function scaleVec3(out: Vec3, a: Vec3, s: number): Vec3 {
  out[0] = a[0] * s;
  out[1] = a[1] * s;
  out[2] = a[2] * s;
  return out;
}

export function crossVec3(out: Vec3, a: Vec3, b: Vec3): Vec3 {
  const ax = a[0], ay = a[1], az = a[2];
  const bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}

export function dotVec3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function lengthVec3(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

export function normalizeVec3(out: Vec3, a: Vec3): Vec3 {
  const len = lengthVec3(a) || 1;
  out[0] = a[0] / len;
  out[1] = a[1] / len;
  out[2] = a[2] / len;
  return out;
}

export function createMat4(): Mat4 {
  const m = new Float32Array(16);
  // identity
  m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1;
  return m;
}

export function copyMat4(out: Mat4, a: Mat4): Mat4 {
  out.set(a);
  return out;
}

export function multiplyMat4(out: Mat4, a: Mat4, b: Mat4): Mat4 {
  // out = a * b (column-major)
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3];
  const b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7];
  const b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11];
  const b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15];

  out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

  out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

  out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

  out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
  return out;
}

export function perspective(out: Mat4, fovyRadians: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovyRadians / 2);
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;

  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;

  out[8] = 0;
  out[9] = 0;
  out[10] = (far + near) / (near - far);
  out[11] = -1;

  out[12] = 0;
  out[13] = 0;
  out[14] = (2 * far * near) / (near - far);
  out[15] = 0;
  return out;
}

export function lookAt(out: Mat4, eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const zAxis = new Float32Array(3);
  const xAxis = new Float32Array(3);
  const yAxis = new Float32Array(3);

  // zAxis = normalize(eye - target)
  zAxis[0] = eye[0] - target[0];
  zAxis[1] = eye[1] - target[1];
  zAxis[2] = eye[2] - target[2];
  normalizeVec3(zAxis, zAxis);

  // xAxis = normalize(cross(up, zAxis))
  crossVec3(xAxis, up, zAxis);
  normalizeVec3(xAxis, xAxis);

  // yAxis = cross(zAxis, xAxis)
  crossVec3(yAxis, zAxis, xAxis);

  out[0] = xAxis[0]; out[1] = yAxis[0]; out[2] = zAxis[0]; out[3] = 0;
  out[4] = xAxis[1]; out[5] = yAxis[1]; out[6] = zAxis[1]; out[7] = 0;
  out[8] = xAxis[2]; out[9] = yAxis[2]; out[10] = zAxis[2]; out[11] = 0;
  out[12] = -(xAxis[0] * eye[0] + xAxis[1] * eye[1] + xAxis[2] * eye[2]);
  out[13] = -(yAxis[0] * eye[0] + yAxis[1] * eye[1] + yAxis[2] * eye[2]);
  out[14] = -(zAxis[0] * eye[0] + zAxis[1] * eye[1] + zAxis[2] * eye[2]);
  out[15] = 1;
  return out;
}

export function invertMat4(out: Mat4, a: Mat4): Mat4 | null {
  // General 4x4 inversion (from gl-matrix, simplified/expanded)
  const m = a;
  const b00 = m[0] * m[5] - m[1] * m[4];
  const b01 = m[0] * m[6] - m[2] * m[4];
  const b02 = m[0] * m[7] - m[3] * m[4];
  const b03 = m[1] * m[6] - m[2] * m[5];
  const b04 = m[1] * m[7] - m[3] * m[5];
  const b05 = m[2] * m[7] - m[3] * m[6];
  const b06 = m[8] * m[13] - m[9] * m[12];
  const b07 = m[8] * m[14] - m[10] * m[12];
  const b08 = m[8] * m[15] - m[11] * m[12];
  const b09 = m[9] * m[14] - m[10] * m[13];
  const b10 = m[9] * m[15] - m[11] * m[13];
  const b11 = m[10] * m[15] - m[11] * m[14];

  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return null;
  const invDet = 1.0 / det;

  out[0] = (m[5] * b11 - m[6] * b10 + m[7] * b09) * invDet;
  out[1] = (m[2] * b10 - m[1] * b11 - m[3] * b09) * invDet;
  out[2] = (m[13] * b05 - m[14] * b04 + m[15] * b03) * invDet;
  out[3] = (m[10] * b04 - m[9] * b05 - m[11] * b03) * invDet;
  out[4] = (m[6] * b08 - m[4] * b11 - m[7] * b07) * invDet;
  out[5] = (m[0] * b11 - m[2] * b08 + m[3] * b07) * invDet;
  out[6] = (m[14] * b02 - m[12] * b05 - m[15] * b01) * invDet;
  out[7] = (m[8] * b05 - m[10] * b02 + m[11] * b01) * invDet;
  out[8] = (m[4] * b10 - m[5] * b08 + m[7] * b06) * invDet;
  out[9] = (m[1] * b08 - m[0] * b10 - m[3] * b06) * invDet;
  out[10] = (m[12] * b04 - m[13] * b03 + m[15] * b00) * invDet;
  out[11] = (m[9] * b03 - m[8] * b04 - m[11] * b00) * invDet;
  out[12] = (m[5] * b07 - m[4] * b09 - m[6] * b06) * invDet;
  out[13] = (m[0] * b09 - m[1] * b07 + m[2] * b06) * invDet;
  out[14] = (m[13] * b01 - m[12] * b02 - m[14] * b00) * invDet;
  out[15] = (m[8] * b02 - m[9] * b01 + m[10] * b00) * invDet;
  return out;
}

export function projectPoint(out: Float32Array, world: Vec3, viewProj: Mat4, viewportWidth: number, viewportHeight: number): Float32Array {
  // clip = M * vec4(world,1)
  const x = world[0], y = world[1], z = world[2];
  const w = viewProj[3] * x + viewProj[7] * y + viewProj[11] * z + viewProj[15];
  const cx = viewProj[0] * x + viewProj[4] * y + viewProj[8] * z + viewProj[12];
  const cy = viewProj[1] * x + viewProj[5] * y + viewProj[9] * z + viewProj[13];
  const cz = viewProj[2] * x + viewProj[6] * y + viewProj[10] * z + viewProj[14];
  const invW = w ? 1 / w : 1;
  const ndcX = cx * invW;
  const ndcY = cy * invW;
  // map to screen (0..width, 0..height)
  out[0] = (ndcX * 0.5 + 0.5) * viewportWidth;
  out[1] = (1 - (ndcY * 0.5 + 0.5)) * viewportHeight; // flip Y for canvas
  out[2] = cz * invW;
  return out;
}
