import { Arcanvas, type ArcanvasPluginInstance } from "../../Arcanvas";
import { createMat4, lookAt, Mat4, perspective, Vec3, createVec3, setVec3, multiplyMat4, copyMat4 } from "../../math";

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
export class Viewport3D implements ArcanvasPluginInstance {
  destroy(): void {
    // TODO: Implement
  }

  private readonly arcanvas: Arcanvas;

  private fovRadians = (60 * Math.PI) / 180;
  private near = 0.1;
  private far = 1000;

  private eye: Vec3 = createVec3(0, 0, 5);
  private target: Vec3 = createVec3(0, 0, 0);
  private up: Vec3 = createVec3(0, 1, 0);

  private viewMatrix: Mat4 = createMat4();
  private projMatrix: Mat4 = createMat4();
  private viewProjMatrix: Mat4 = createMat4();

  constructor(arcanvas: Arcanvas, options: Viewport3DOptions = {}) {
    this.arcanvas = arcanvas;
    if (typeof options.fovDegrees === "number") this.fovRadians = (options.fovDegrees * Math.PI) / 180;
    if (typeof options.near === "number") this.near = options.near;
    if (typeof options.far === "number") this.far = options.far;
    if (options.eye) setVec3(this.eye, options.eye.x, options.eye.y, options.eye.z);
    if (options.target) setVec3(this.target, options.target.x, options.target.y, options.target.z);
    if (options.up) setVec3(this.up, options.up.x, options.up.y, options.up.z);

    this.updateMatrices();
    this.arcanvas.provide(Viewport3D, this);
  }

  getEye(): Vec3 { return this.eye; }
  getTarget(): Vec3 { return this.target; }
  getUp(): Vec3 { return this.up; }

  setEye(x: number, y: number, z: number) { setVec3(this.eye, x, y, z); this.updateMatrices(); }
  setTarget(x: number, y: number, z: number) { setVec3(this.target, x, y, z); this.updateMatrices(); }
  setUp(x: number, y: number, z: number) { setVec3(this.up, x, y, z); this.updateMatrices(); }

  setFovDegrees(deg: number) { this.fovRadians = (deg * Math.PI) / 180; this.updateMatrices(); }
  setNearFar(near: number, far: number) { this.near = near; this.far = far; this.updateMatrices(); }

  getViewMatrix(out?: Mat4): Mat4 { return out ? copyMat4(out, this.viewMatrix) : this.viewMatrix; }
  getProjMatrix(out?: Mat4): Mat4 { return out ? copyMat4(out, this.projMatrix) : this.projMatrix; }
  getViewProjMatrix(out?: Mat4): Mat4 { return out ? copyMat4(out, this.viewProjMatrix) : this.viewProjMatrix; }

  updateMatrices() {
    const canvas = this.arcanvas.canvas;
    const aspect = Math.max(1e-6, canvas.width / Math.max(1, canvas.height));
    lookAt(this.viewMatrix, this.eye, this.target, this.up);
    perspective(this.projMatrix, this.fovRadians, aspect, this.near, this.far);
    multiplyMat4(this.viewProjMatrix, this.projMatrix, this.viewMatrix);
  }
}

export const viewport3DPlugin = (arcanvas: Arcanvas) => new Viewport3D(arcanvas);
