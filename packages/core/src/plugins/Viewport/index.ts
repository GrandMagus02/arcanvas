import { Matrix4 } from "@arcanvas/matrix";
import { Float32Vector } from "@arcanvas/vector";
import { type Plugin } from "../../Arcanvas";

/**
 * Options for the Viewport3D plugin.
 */
export interface Viewport3DOptions {
  fovDegrees?: number;
  near?: number;
  far?: number;
  eye?: { x: number; y: number; z: number };
  target?: { x: number; y: number; z: number };
  up?: { x: number; y: number; z: number };
}

/**
 * Maintains 3D camera matrices (view and projection) and exposes helpers.
 */
export type ViewportAPI = {
  getEye(): Float32Vector;
  getTarget(): Float32Vector;
  getUp(): Float32Vector;
  setEye(x: number, y: number, z: number): void;
  setTarget(x: number, y: number, z: number): void;
  setUp(x: number, y: number, z: number): void;
  setFovDegrees(deg: number): void;
  setNearFar(near: number, far: number): void;
  getViewMatrix(out?: Matrix4): Matrix4;
  getProjMatrix(out?: Matrix4): Matrix4;
  getViewProjMatrix(out?: Matrix4): Matrix4;
  updateMatrices(): void;
};

export const Viewport: Plugin<"viewport", ViewportAPI, Viewport3DOptions> = {
  name: "viewport",
  setup(ctx, options = {}) {
    let fovRadians = (60 * Math.PI) / 180;
    let near = 0.1;
    let far = 1000;
    let eye = new Float32Vector(0, 0, 5);
    let target = new Float32Vector(0, 0, 0);
    let up = new Float32Vector(0, 1, 0);
    let viewMatrix: Matrix4 = Matrix4.fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    let projMatrix: Matrix4 = Matrix4.fromArray([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    let viewProjMatrix: Matrix4 = Matrix4.fromArray([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]);

    if (typeof options.fovDegrees === "number") fovRadians = (options.fovDegrees * Math.PI) / 180;
    if (typeof options.near === "number") near = options.near;
    if (typeof options.far === "number") far = options.far;
    if (options.eye) eye = new Float32Vector(options.eye.x, options.eye.y, options.eye.z);
    if (options.target)
      target = new Float32Vector(options.target.x, options.target.y, options.target.z);
    if (options.up) up = new Float32Vector(options.up.x, options.up.y, options.up.z);

    const updateMatrices = () => {
      const canvas = ctx.canvas;
      const aspect = Math.max(1e-6, canvas.width / Math.max(1, canvas.height));
      viewMatrix = createLookAt(eye, target, up);
      projMatrix = createPerspective(fovRadians, aspect, near, far);
      viewProjMatrix = projMatrix.multiplyMatrix(viewMatrix);
    };
    updateMatrices();

    return {
      getEye: () => eye,
      getTarget: () => target,
      getUp: () => up,
      setEye: (x, y, z) => {
        eye = new Float32Vector(x, y, z);
        updateMatrices();
      },
      setTarget: (x, y, z) => {
        target = new Float32Vector(x, y, z);
        updateMatrices();
      },
      setUp: (x, y, z) => {
        up = new Float32Vector(x, y, z);
        updateMatrices();
      },
      setFovDegrees: (deg) => {
        fovRadians = (deg * Math.PI) / 180;
        updateMatrices();
      },
      setNearFar: (n, f) => {
        near = n;
        far = f;
        updateMatrices();
      },
      getViewMatrix: (out?: Matrix4) =>
        out ? Matrix4.fromArray(viewMatrix.toArray()) : viewMatrix,
      getProjMatrix: (out?: Matrix4) =>
        out ? Matrix4.fromArray(projMatrix.toArray()) : projMatrix,
      getViewProjMatrix: (out?: Matrix4) =>
        out ? Matrix4.fromArray(viewProjMatrix.toArray()) : viewProjMatrix,
      updateMatrices,
    };
  },
};

/**
 * Creates a perspective matrix.
 */
function createPerspective(fovRadians: number, aspect: number, near: number, far: number): Matrix4 {
  const f = 1 / Math.max(1e-6, Math.tan(fovRadians / 2));
  const nf = 1 / (near - far);
  return Matrix4.fromArray([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * nf,
    2 * far * near * nf,
    0,
    0,
    -1,
    0,
  ]);
}

/**
 * Creates a look at matrix.
 */
function createLookAt(eye: Float32Vector, target: Float32Vector, up: Float32Vector): Matrix4 {
  const f = target.subtract(eye).normalize();
  const s = normalize(cross(f, up));
  const u = cross(s, f);
  const ex = -dot(s, eye);
  const ey = -dot(u, eye);
  const ez = dot(f, eye);
  return Matrix4.fromArray([
    s.toArray()[0]!,
    u.toArray()[0]!,
    -f.toArray()[0]!,
    0,
    s.toArray()[1]!,
    u.toArray()[1]!,
    -f.toArray()[1]!,
    0,
    s.toArray()[2]!,
    u.toArray()[2]!,
    -f.toArray()[2]!,
    0,
    ex,
    ey,
    ez,
    1,
  ]);
}

/**
 * Calculates the dot product of two vectors.
 */
function dot(a: Float32Vector, b: Float32Vector): number {
  return a.dot(b);
}

/**
 * Calculates the dot product of two vectors.
 */
function cross(a: Float32Vector, b: Float32Vector): Float32Vector {
  const av = a.toArray();
  const bv = b.toArray();
  const cx = av[1]! * bv[2]! - av[2]! * bv[1]!;
  const cy = av[2]! * bv[0]! - av[0]! * bv[2]!;
  const cz = av[0]! * bv[1]! - av[1]! * bv[0]!;
  return new Float32Vector(cx, cy, cz);
}

/**
 * Normalizes a vector.
 */
function normalize(v: Float32Vector): Float32Vector {
  return v.normalize();
}
