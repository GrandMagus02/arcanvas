import { Vector3 } from "@arcanvas/vector";
import type { Arcanvas } from "../Arcanvas";
import { EventKey } from "../utils";
import { ProjectionMatrix } from "../utils/ProjectionMatrix";
import { Subscribable } from "../utils/Subscribable";
import { ViewMatrix } from "../utils/ViewMatrix";
import { CameraControllerManager } from "./CameraControllerManager";
import { CameraEventKey } from "./CameraEvents";

/**
 * Options for configuring a Camera instance.
 */
export interface CameraOptions {
  /** Initial eye position */
  eye?: Vector3;
  /** Initial center position */
  center?: Vector3;
  /** Initial up vector */
  up?: Vector3;
  /** Initial pitch in radians */
  pitch?: number;
  /** Initial yaw in radians */
  yaw?: number;
  /** Initial roll in radians */
  roll?: number;
  /** Whether to use rotation mode initially */
  useRotation?: boolean;
}

/**
 * Base Camera class that controls the view and projection.
 * Cameras are not Nodes - they are separate instances that control what is rendered.
 */
export class Camera extends Subscribable {
  protected _arc: Arcanvas | undefined = undefined;
  protected _pos: Vector3 = new Vector3();
  protected _view: ViewMatrix = new ViewMatrix(this._pos);
  protected _projection: ProjectionMatrix = new ProjectionMatrix();
  // Rotation angles in radians (pitch, yaw, roll)
  protected _pitch: number = 0;
  protected _yaw: number = 0;
  protected _roll: number = 0;
  // Flag to track if we're using rotation mode (true) or manual positioning (false)
  protected _useRotation: boolean = false;
  private _controllers?: CameraControllerManager;

  constructor(arc?: Arcanvas, options?: CameraOptions) {
    super();
    if (arc) {
      this.arcanvas = arc;
    }
    // Apply options if provided
    if (options) {
      if (options.eye) {
        this._view.eye = options.eye;
      }
      if (options.center) {
        this._view.center = options.center;
      }
      if (options.up) {
        this._view.up = options.up;
      }
      if (options.pitch !== undefined) {
        this._pitch = options.pitch;
      }
      if (options.yaw !== undefined) {
        this._yaw = options.yaw;
      }
      if (options.roll !== undefined) {
        this._roll = options.roll;
      }
      if (options.useRotation) {
        this._useRotation = true;
        this.updateView();
      }
    }
    // Don't auto-initialize rotation - let user set eye/center first
    // Rotation will be initialized when first rotation method is called
  }

  /**
   * Initialize rotation angles from current eye/center positions.
   * Called automatically when rotation methods are used, or can be called manually.
   */
  protected initializeRotation(): void {
    const eye = this._view.eye;
    const center = this._view.center;

    const dx = eye.data[0]! - center.data[0]!;
    const dy = eye.data[1]! - center.data[1]!;
    const dz = eye.data[2]! - center.data[2]!;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > 1e-6) {
      // Calculate initial pitch and yaw from eye position
      this._pitch = Math.asin(Math.max(-1, Math.min(1, dy / distance))); // Clamp to prevent NaN
      this._yaw = Math.atan2(dz, dx);
    } else {
      // Default rotation if eye and center are the same
      this._pitch = 0;
      this._yaw = 0;
    }
    this._useRotation = true;
  }

  set arcanvas(arc: Arcanvas) {
    this._arc = arc;
    this._arc?.on(EventKey.Resize, this.onResize.bind(this));
  }

  get arcanvas(): Arcanvas | undefined {
    return this._arc;
  }

  get projection(): ProjectionMatrix {
    return this._projection;
  }

  move(dx: number, dy: number, dz: number): void {
    // Move the eye position directly (manual positioning mode)
    const eye = this._view.eye;
    const newEye = new Vector3(new Float32Array([eye.data[0]! + dx, eye.data[1]! + dy, eye.data[2]! + dz]));
    this._view.eye = newEye;
    // If we're in rotation mode, update rotation angles
    if (this._useRotation) {
      this.initializeRotation();
      this.updateView();
    }
    this.emit(CameraEventKey.Move, newEye.data[0]!, newEye.data[1]!, newEye.data[2]!);
  }

  /**
   * Rotate camera around X axis (pitch - up/down)
   * @param angle - Rotation angle in radians
   */
  rotateX(angle: number): void {
    // Initialize rotation if not already done
    if (!this._useRotation) {
      this.initializeRotation();
    }
    this._pitch += angle;
    // Clamp pitch to prevent gimbal lock
    this._pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this._pitch));
    this.updateView();
    this.emit(CameraEventKey.Rotate, this._pitch, this._yaw, this._roll);
  }

  /**
   * Rotate camera around Y axis (yaw - left/right)
   * @param angle - Rotation angle in radians
   */
  rotateY(angle: number): void {
    // Initialize rotation if not already done
    if (!this._useRotation) {
      this.initializeRotation();
    }
    this._yaw += angle;
    // Normalize yaw to [-PI, PI]
    this._yaw = ((this._yaw % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (this._yaw > Math.PI) this._yaw -= 2 * Math.PI;
    this.updateView();
    this.emit(CameraEventKey.Rotate, this._pitch, this._yaw, this._roll);
  }

  /**
   * Rotate camera around Z axis (roll - tilt)
   * @param angle - Rotation angle in radians
   */
  rotateZ(angle: number): void {
    // Initialize rotation if not already done
    if (!this._useRotation) {
      this.initializeRotation();
    }
    this._roll += angle;
    this.updateView();
    this.emit(CameraEventKey.Rotate, this._pitch, this._yaw, this._roll);
  }

  /**
   * Update the view matrix based on current position and rotation.
   * Implements orbit-style rotation around the center point.
   * Only updates if rotation mode is enabled.
   */
  protected updateView(): void {
    // Only update view if we're in rotation mode
    if (!this._useRotation) {
      return;
    }

    const center = this._view.center;
    const eye = this._view.eye;

    // Calculate distance from eye to center
    const dx = eye.data[0]! - center.data[0]!;
    const dy = eye.data[1]! - center.data[1]!;
    const dz = eye.data[2]! - center.data[2]!;
    let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // If distance is too small, use a default distance
    if (distance < 1e-6 || !isFinite(distance)) {
      distance = 5.0; // Default distance
    }

    // Validate rotation angles
    if (!isFinite(this._pitch) || !isFinite(this._yaw) || !isFinite(this._roll)) {
      console.warn("Camera: Invalid rotation angles, resetting to 0");
      this._pitch = 0;
      this._yaw = 0;
      this._roll = 0;
    }

    // Calculate new eye position based on rotation (spherical coordinates)
    const cosPitch = Math.cos(this._pitch);
    const sinPitch = Math.sin(this._pitch);
    const cosYaw = Math.cos(this._yaw);
    const sinYaw = Math.sin(this._yaw);

    // Validate trigonometric values
    if (!isFinite(cosPitch) || !isFinite(sinPitch) || !isFinite(cosYaw) || !isFinite(sinYaw)) {
      console.error("Camera: Invalid trigonometric values in updateView");
      return;
    }

    // Spherical to Cartesian conversion
    // x = r * cos(pitch) * cos(yaw)
    // y = r * sin(pitch)
    // z = r * cos(pitch) * sin(yaw)
    const newEyeX = center.data[0]! + distance * cosPitch * cosYaw;
    const newEyeY = center.data[1]! + distance * sinPitch;
    const newEyeZ = center.data[2]! + distance * cosPitch * sinYaw;

    // Validate new eye position
    if (!isFinite(newEyeX) || !isFinite(newEyeY) || !isFinite(newEyeZ)) {
      console.error("Camera: Invalid eye position calculated in updateView");
      return;
    }

    const newEye = new Vector3(new Float32Array([newEyeX, newEyeY, newEyeZ]));

    // Calculate up vector with roll rotation
    // For roll, we rotate the up vector around the view direction
    const viewDirX = -(newEyeX - center.data[0]!);
    const viewDirY = -(newEyeY - center.data[1]!);
    const viewDirZ = -(newEyeZ - center.data[2]!);
    const viewDirLen = Math.sqrt(viewDirX * viewDirX + viewDirY * viewDirY + viewDirZ * viewDirZ);

    if (viewDirLen < 1e-6 || !isFinite(viewDirLen)) {
      console.warn("Camera: View direction is too small or invalid, using default up");
      const defaultUp = new Vector3(new Float32Array([0, 1, 0]));
      this._view.update(newEye, center, defaultUp);
      return;
    }

    const viewDir = new Vector3(new Float32Array([viewDirX / viewDirLen, viewDirY / viewDirLen, viewDirZ / viewDirLen]));

    // Default up vector perpendicular to view direction
    const defaultUp = new Vector3(new Float32Array([0, 1, 0]));
    // Project default up onto plane perpendicular to view direction
    const upDotView = defaultUp.dot(viewDir);
    const viewDirScaled = viewDir.clone().scale(upDotView);
    const projectedUp = defaultUp.clone().sub(viewDirScaled);
    const projUpLen = Math.sqrt(projectedUp.data[0]! * projectedUp.data[0]! + projectedUp.data[1]! * projectedUp.data[1]! + projectedUp.data[2]! * projectedUp.data[2]!);

    if (projUpLen < 1e-6) {
      // View direction is parallel to up vector, use alternative
      const altUp = new Vector3(new Float32Array([0, 0, 1]));
      const altUpDotView = altUp.dot(viewDir);
      const altViewDirScaled = viewDir.clone().scale(altUpDotView);
      const altProjectedUp = altUp.clone().sub(altViewDirScaled).normalize();
      const right = viewDir.clone().cross(altProjectedUp).normalize();
      const cosRoll = Math.cos(this._roll);
      const sinRoll = Math.sin(this._roll);
      const altProjectedUpScaled = altProjectedUp.clone().scale(cosRoll);
      const rightScaled = right.clone().scale(sinRoll);
      const up = altProjectedUpScaled.add(rightScaled).normalize();
      this._view.update(newEye, center, up as Vector3);
      return;
    }

    const projectedUpNorm = projectedUp.normalize();

    // Apply roll rotation around view direction
    const cosRoll = Math.cos(this._roll);
    const sinRoll = Math.sin(this._roll);
    // Find a vector perpendicular to both viewDir and projectedUp
    const right = viewDir.clone().cross(projectedUpNorm).normalize();
    // Rotate projectedUp around viewDir by roll angle
    const projectedUpScaled = projectedUpNorm.clone().scale(cosRoll);
    const rightScaled = right.clone().scale(sinRoll);
    const up = projectedUpScaled.add(rightScaled).normalize();

    // Validate up vector
    const upLen = Math.sqrt(up.data[0]! * up.data[0]! + up.data[1]! * up.data[1]! + up.data[2]! * up.data[2]!);
    if (upLen < 1e-6 || !isFinite(upLen)) {
      console.warn("Camera: Invalid up vector, using default");
      const defaultUpVec = new Vector3(new Float32Array([0, 1, 0]));
      this._view.update(newEye, center, defaultUpVec);
      return;
    }

    this._view.update(newEye, center, up as Vector3);
  }

  get view(): ViewMatrix {
    return this._view;
  }

  /**
   * Get the controller manager for this camera.
   * Lazily initializes the manager on first access.
   */
  get controllers(): CameraControllerManager {
    if (!this._controllers && this._arc) {
      this._controllers = new CameraControllerManager(this, this._arc);
    }
    if (!this._controllers) {
      throw new Error("Camera must be attached to an Arcanvas instance before accessing controllers");
    }
    return this._controllers;
  }

  protected onResize(...args: unknown[]): void {
    const width = args[0] as number;
    const height = args[1] as number;
    this._projection.update({
      aspect: width / height,
    });
  }
}
