import { Arcanvas } from "../../Arcanvas";
import { Viewport3D } from "../Viewport3D";
import { Vec3, createVec3, setVec3 } from "../../math";

export interface Camera3DOptions {
  viewport3D?: Viewport3D;
  orbitButton?: number; // 0 left, 1 middle, 2 right
  panButton?: number; // alternative pan button (e.g., right)
  dollySpeed?: number; // wheel scale
}

/**
 * Mouse-driven orbit, pan, and dolly around the Viewport3D target.
 */
export class Camera3D {
  private readonly arcanvas: Arcanvas;
  private readonly viewport3D: Viewport3D;

  private orbitButton = 0;
  private panButton = 2;
  private dollySpeed = 1.1;

  private isOrbiting = false;
  private isPanning = false;
  private lastX = 0;
  private lastY = 0;

  private polarTheta = Math.PI / 4; // azimuth
  private polarPhi = Math.PI / 4; // elevation
  private radius = 10;

  private boundDown?: (e: PointerEvent) => void;
  private boundMove?: (e: PointerEvent) => void;
  private boundUp?: (e: PointerEvent) => void;
  private boundLeave?: (e: PointerEvent) => void;
  private boundWheel?: (e: WheelEvent) => void;

  constructor(arcanvas: Arcanvas, options: Camera3DOptions = {}) {
    this.arcanvas = arcanvas;
    const injected = options.viewport3D ?? arcanvas.inject<Viewport3D>(Viewport3D);
    this.viewport3D = injected ?? new Viewport3D(arcanvas);
    this.orbitButton = options.orbitButton ?? 0;
    this.panButton = options.panButton ?? 2;
    this.dollySpeed = options.dollySpeed ?? 1.1;

    // Initialize spherical from current eye-target
    const eye = this.viewport3D.getEye();
    const target = this.viewport3D.getTarget();
    const dx = eye[0] - target[0];
    const dy = eye[1] - target[1];
    const dz = eye[2] - target[2];
    this.radius = Math.max(0.001, Math.hypot(dx, dy, dz));
    this.polarTheta = Math.atan2(dx, dz);
    this.polarPhi = Math.acos(Math.min(0.999, Math.max(-0.999, dy / this.radius)));

    this.attach();
    this.arcanvas.provide(Camera3D, this);
  }

  private attach() {
    const canvas = this.arcanvas.canvas;
    canvas.style.touchAction = "none";

    this.boundDown = (e: PointerEvent) => {
      if (e.button === this.orbitButton) {
        this.isOrbiting = true;
      } else if (e.button === this.panButton) {
        this.isPanning = true;
      } else {
        return;
      }
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };

    this.boundMove = (e: PointerEvent) => {
      if (!this.isOrbiting && !this.isPanning) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      if (this.isOrbiting) {
        this.orbit(dx, dy);
      } else if (this.isPanning) {
        this.pan(dx, dy);
      }
    };

    this.boundUp = (e: PointerEvent) => {
      if (e.button === this.orbitButton) this.isOrbiting = false;
      if (e.button === this.panButton) this.isPanning = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    };

    this.boundLeave = () => { this.isOrbiting = false; this.isPanning = false; };

    this.boundWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1 / this.dollySpeed : this.dollySpeed;
      this.dolly(factor);
    };

    canvas.addEventListener("pointerdown", this.boundDown);
    canvas.addEventListener("pointermove", this.boundMove);
    canvas.addEventListener("pointerup", this.boundUp);
    canvas.addEventListener("pointerleave", this.boundLeave);
    canvas.addEventListener("wheel", this.boundWheel, { passive: false });
  }

  destroy() {
    const canvas = this.arcanvas.canvas;
    if (this.boundDown) canvas.removeEventListener("pointerdown", this.boundDown);
    if (this.boundMove) canvas.removeEventListener("pointermove", this.boundMove);
    if (this.boundUp) canvas.removeEventListener("pointerup", this.boundUp);
    if (this.boundLeave) canvas.removeEventListener("pointerleave", this.boundLeave);
    if (this.boundWheel) canvas.removeEventListener("wheel", this.boundWheel);
  }

  private orbit(deltaX: number, deltaY: number) {
    const rotSpeed = 0.005;
    this.polarTheta += deltaX * rotSpeed;
    this.polarPhi += deltaY * rotSpeed;
    // Clamp phi to avoid flipping
    const eps = 1e-3;
    this.polarPhi = Math.max(eps, Math.min(Math.PI - eps, this.polarPhi));
    this.updateEyeFromSpherical();
  }

  private pan(deltaX: number, deltaY: number) {
    // Pan in camera's local X/Y at depth proportional to radius
    const scale = this.radius * 0.002;
    const view = this.viewport3D.getViewMatrix();
    // camera right = view column 0 (xAxis)
    const rightX = view[0], rightY = view[1], rightZ = view[2];
    // camera up = view column 1 (yAxis)
    const upX = view[4], upY = view[5], upZ = view[6];
    const tx = -(rightX * deltaX * scale + upX * -deltaY * scale);
    const ty = -(rightY * deltaX * scale + upY * -deltaY * scale);
    const tz = -(rightZ * deltaX * scale + upZ * -deltaY * scale);
    const tgt = this.viewport3D.getTarget();
    const eye = this.viewport3D.getEye();
    this.viewport3D.setTarget(tgt[0] + tx, tgt[1] + ty, tgt[2] + tz);
    this.viewport3D.setEye(eye[0] + tx, eye[1] + ty, eye[2] + tz);
  }

  private dolly(factor: number) {
    this.radius *= factor;
    this.radius = Math.max(0.001, Math.min(1e6, this.radius));
    this.updateEyeFromSpherical();
  }

  private updateEyeFromSpherical() {
    const sinPhi = Math.sin(this.polarPhi);
    const cosPhi = Math.cos(this.polarPhi);
    const sinTheta = Math.sin(this.polarTheta);
    const cosTheta = Math.cos(this.polarTheta);
    const x = this.radius * sinPhi * sinTheta;
    const y = this.radius * cosPhi;
    const z = this.radius * sinPhi * cosTheta;
    const tgt = this.viewport3D.getTarget();
    this.viewport3D.setEye(tgt[0] + x, tgt[1] + y, tgt[2] + z);
  }
}

export const camera3DPlugin = (arcanvas: Arcanvas) => new Camera3D(arcanvas);
