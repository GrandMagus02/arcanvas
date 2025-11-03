// camera/Camera3D.ts
import type { Arcanvas } from "../Arcanvas";
import { TransformationMatrix } from "../utils/TransformationMatrix";
import { Camera } from "./Camera";

/**
 *
 */
export interface Camera3DOptions {
  moveSpeed?: number;
  rotationSpeed?: number;
  enableControls?: boolean;
  projectionMode?: "perspective" | "orthographic";
  fovY?: number; // radians
  near?: number;
  far?: number;
  orthoHeight?: number; // world units visible vertically
  clipZ01?: boolean; // true for [0,1], false for [-1,1]
}

/**
 *
 */
export class Camera3D extends Camera {
  private _x = 0;
  private _y = 0;
  private _z = 0;
  private _pitch = 0; // X axis
  private _yaw = 0; // Y axis

  private _moveSpeed: number;
  private _rotationSpeed: number;
  private _enableControls: boolean;

  private _keys: Set<string> = new Set();
  private _keyHandlers: Array<() => void> = [];
  private _lastUpdateTime = 0;
  private _updateLoop: number | null = null;
  private _isDragging = false;
  private _lastMouseX = 0;
  private _lastMouseY = 0;
  private _mouseHandlers: Array<() => void> = [];

  private _projectionMode: "perspective" | "orthographic";
  private _fovY: number;
  private _near: number;
  private _far: number;
  private _orthoHeight: number;
  private _clipZ01: boolean;

  constructor(app: Arcanvas, options: Camera3DOptions = {}) {
    super(app);
    this._moveSpeed = options.moveSpeed ?? 100;
    this._rotationSpeed = options.rotationSpeed ?? 1;
    this._enableControls = options.enableControls ?? true;

    this._projectionMode = options.projectionMode ?? "perspective";
    this._fovY = options.fovY ?? (60 * Math.PI) / 180;
    this._near = options.near ?? 0.1;
    this._far = options.far ?? 1000;
    this._orthoHeight = options.orthoHeight ?? 10; // default 10 world units
    this._clipZ01 = options.clipZ01 ?? false; // default OpenGL

    this.updateProjection();
  }

  get x() {
    return this._x;
  }
  set x(v: number) {
    if (this._x !== v) {
      this._x = v;
      this._isProjectionDirty = true;
      this.emit("move", this._x, this._y, this._z);
    }
  }

  get y() {
    return this._y;
  }
  set y(v: number) {
    if (this._y !== v) {
      this._y = v;
      this._isProjectionDirty = true;
      this.emit("move", this._x, this._y, this._z);
    }
  }

  get z() {
    return this._z;
  }
  set z(v: number) {
    if (this._z !== v) {
      this._z = v;
      this._isProjectionDirty = true;
      this.emit("move", this._x, this._y, this._z);
    }
  }

  get pitch() {
    return this._pitch;
  }
  set pitch(v: number) {
    const clamped = Math.max(-Math.PI / 2 + 1e-4, Math.min(Math.PI / 2 - 1e-4, v));
    if (this._pitch !== clamped) {
      this._pitch = clamped;
      this._isProjectionDirty = true;
      this.emit("rotate", this._pitch, this._yaw);
    }
  }

  get yaw() {
    return this._yaw;
  }
  set yaw(v: number) {
    if (this._yaw !== v) {
      this._yaw = v;
      this._isProjectionDirty = true;
      this.emit("rotate", this._pitch, this._yaw);
    }
  }

  setProjectionMode(mode: "perspective" | "orthographic") {
    if (this._projectionMode !== mode) {
      this._projectionMode = mode;
      this._isProjectionDirty = true;
    }
  }

  move(dx: number, dy: number, dz: number) {
    this.x += dx;
    this.y += dy;
    this.z += dz;
  }
  rotate(deltaPitch: number, deltaYaw: number) {
    this.pitch += deltaPitch;
    this.yaw += deltaYaw;
  }

  protected updateProjection(): void {
    const width = this.app.canvas.width;
    const height = this.app.canvas.height;
    const aspect = Math.max(1e-6, width / Math.max(1, height));

    // View: from yaw/pitch and position
    // Forward from yaw/pitch (Y-up, right-handed)
    const cp = Math.cos(this._pitch);
    const sp = Math.sin(this._pitch);
    const cy = Math.cos(this._yaw);
    const sy = Math.sin(this._yaw);
    const dirX = sy * cp;
    const dirY = -sp;
    const dirZ = cy * cp;

    const viewArr = TransformationMatrix.makeLookTo(this._x, this._y, this._z, dirX, dirY, dirZ, 0, 1, 0);

    // Projection
    const projArr =
      this._projectionMode === "perspective"
        ? TransformationMatrix.makePerspectiveFov(this._fovY, aspect, this._near, this._far, this._clipZ01)
        : (() => {
            // Ortho width from height and aspect
            const halfH = this._orthoHeight * 0.5;
            const halfW = halfH * aspect;
            return TransformationMatrix.makeOrtho(-halfW, halfW, -halfH, halfH, this._near, this._far, this._clipZ01);
          })();

    // VP = P * V
    const mul = (a: number[], b: number[]) => {
      const out = new Array<number>(16);
      for (let r = 0; r < 4; r++) {
        const i = r * 4;
        out[i + 0] = a[i + 0]! * b[0]! + a[i + 1]! * b[4]! + a[i + 2]! * b[8]! + a[i + 3]! * b[12]!;
        out[i + 1] = a[i + 0]! * b[1]! + a[i + 1]! * b[5]! + a[i + 2]! * b[9]! + a[i + 3]! * b[13]!;
        out[i + 2] = a[i + 0]! * b[2]! + a[i + 1]! * b[6]! + a[i + 2]! * b[10]! + a[i + 3]! * b[14]!;
        out[i + 3] = a[i + 0]! * b[3]! + a[i + 1]! * b[7]! + a[i + 2]! * b[11]! + a[i + 3]! * b[15]!;
      }
      return out;
    };

    const vp = mul(projArr, viewArr);
    this._projection.setRowMajor(vp);
  }

  protected override onActivate(): void {
    if (!this._enableControls) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      this._keys.add(e.key.toLowerCase());
      e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      this._keys.delete(e.key.toLowerCase());
      e.preventDefault();
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    this._keyHandlers.push(
      () => window.removeEventListener("keydown", handleKeyDown),
      () => window.removeEventListener("keyup", handleKeyUp)
    );

    const canvas = this.app.canvas;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        this._isDragging = true;
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
        canvas.style.cursor = "grabbing";
        e.preventDefault();
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (this._isDragging) {
        const dx = e.clientX - this._lastMouseX;
        const dy = e.clientY - this._lastMouseY;
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;

        // Move in camera's XZ plane by yaw
        const cy = Math.cos(this._yaw);
        const sy = Math.sin(this._yaw);
        const worldDx = dx;
        const worldDz = -dy;
        const moveDx = worldDx * cy + worldDz * sy;
        const moveDz = -worldDx * sy + worldDz * cy;
        this.move(moveDx, 0, moveDz);

        e.preventDefault();
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        this._isDragging = false;
        canvas.style.cursor = "";
        e.preventDefault();
      }
    };
    const handleMouseLeave = () => {
      this._isDragging = false;
      canvas.style.cursor = "";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    this._mouseHandlers.push(
      () => canvas.removeEventListener("mousedown", handleMouseDown),
      () => window.removeEventListener("mousemove", handleMouseMove),
      () => window.removeEventListener("mouseup", handleMouseUp),
      () => canvas.removeEventListener("mouseleave", handleMouseLeave)
    );

    this._lastUpdateTime = performance.now();
    const update = (now: number) => {
      if (!this.active) return;
      const dt = (now - this._lastUpdateTime) / 1000;
      this._lastUpdateTime = now;

      const cy = Math.cos(this._yaw);
      const sy = Math.sin(this._yaw);

      let forward = 0;
      let right = 0;
      let up = 0;

      if (this._keys.has("w")) forward += this._moveSpeed * dt;
      if (this._keys.has("s")) forward -= this._moveSpeed * dt;
      if (this._keys.has("a")) right -= this._moveSpeed * dt;
      if (this._keys.has("d")) right += this._moveSpeed * dt;
      if (this._keys.has("q")) up += this._moveSpeed * dt;
      if (this._keys.has("e")) up -= this._moveSpeed * dt;

      if (forward !== 0 || right !== 0 || up !== 0) {
        const dx = forward * sy + right * cy;
        const dz = forward * cy - right * sy;
        this.move(dx, up, dz);
      }

      if (this._keys.has("arrowup")) this.rotate(-this._rotationSpeed * dt, 0);
      if (this._keys.has("arrowdown")) this.rotate(this._rotationSpeed * dt, 0);
      if (this._keys.has("arrowleft")) this.rotate(0, -this._rotationSpeed * dt);
      if (this._keys.has("arrowright")) this.rotate(0, this._rotationSpeed * dt);

      this._isProjectionDirty = true;
      this._updateLoop = requestAnimationFrame(update);
    };
    this._updateLoop = requestAnimationFrame(update);
  }

  protected override onDeactivate(): void {
    this._keyHandlers.forEach((c) => c());
    this._keyHandlers = [];
    this._keys.clear();

    this._mouseHandlers.forEach((c) => c());
    this._mouseHandlers = [];
    this._isDragging = false;
    this.app.canvas.style.cursor = "";

    if (this._updateLoop !== null) {
      cancelAnimationFrame(this._updateLoop);
      this._updateLoop = null;
    }
  }
}
