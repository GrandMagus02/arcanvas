import { Vector3 } from "@arcanvas/vector";
import type { Arcanvas } from "../../Arcanvas";
import type { Camera } from "../Camera";
import { CameraController, type CameraControllerOptions } from "../CameraController";

/**
 * Options for WASDController.
 */
export interface WASDControllerOptions extends CameraControllerOptions {
  /** Movement speed multiplier */
  movementSpeed?: number;
  /** Rotation speed multiplier */
  rotationSpeed?: number;
  /** Key for forward movement */
  forwardKey?: string;
  /** Key for backward movement */
  backwardKey?: string;
  /** Key for left movement */
  leftKey?: string;
  /** Key for right movement */
  rightKey?: string;
  /** Key for up movement */
  upKey?: string;
  /** Key for down movement */
  downKey?: string;
  /** Key for rotate left */
  rotateLeftKey?: string;
  /** Key for rotate right */
  rotateRightKey?: string;
  /** Key for rotate up */
  rotateUpKey?: string;
  /** Key for rotate down */
  rotateDownKey?: string;
}

/**
 * Controller for WASD keyboard movement and arrow key rotation.
 */
export class WASDController extends CameraController<WASDControllerOptions> {
  private _keys = new Set<string>();
  private _keydownHandler?: (e: KeyboardEvent) => void;
  private _keyupHandler?: (e: KeyboardEvent) => void;

  constructor(camera: Camera, arcanvas: Arcanvas, options: WASDControllerOptions = {}) {
    super(camera, arcanvas, {
      movementSpeed: 0.1,
      rotationSpeed: 0.01,
      forwardKey: "w",
      backwardKey: "s",
      leftKey: "a",
      rightKey: "d",
      upKey: "q",
      downKey: "e",
      rotateLeftKey: "ArrowLeft",
      rotateRightKey: "ArrowRight",
      rotateUpKey: "ArrowUp",
      rotateDownKey: "ArrowDown",
      ...options,
    });
  }

  attach(): void {
    this._keydownHandler = (e: KeyboardEvent) => {
      this._keys.add(e.key.toLowerCase());
      this.handleInput();
    };

    this._keyupHandler = (e: KeyboardEvent) => {
      this._keys.delete(e.key.toLowerCase());
    };

    document.addEventListener("keydown", this._keydownHandler);
    document.addEventListener("keyup", this._keyupHandler);
  }

  detach(): void {
    if (this._keydownHandler) {
      document.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = undefined;
    }
    if (this._keyupHandler) {
      document.removeEventListener("keyup", this._keyupHandler);
      this._keyupHandler = undefined;
    }
    this._keys.clear();
  }

  override update(deltaTime: number): void {
    if (this._keys.size > 0) {
      this.handleInput(deltaTime);
    }
  }

  private handleInput(deltaTime: number = 1): void {
    const opts = this._options;
    const speed = (opts.movementSpeed ?? 0.1) * deltaTime;
    const rotSpeed = (opts.rotationSpeed ?? 0.01) * deltaTime;

    // Movement
    if (this._keys.has(opts.forwardKey!.toLowerCase())) {
      this.moveForward(speed);
    }
    if (this._keys.has(opts.backwardKey!.toLowerCase())) {
      this.moveBackward(speed);
    }
    if (this._keys.has(opts.leftKey!.toLowerCase())) {
      this.moveLeft(speed);
    }
    if (this._keys.has(opts.rightKey!.toLowerCase())) {
      this.moveRight(speed);
    }
    if (this._keys.has(opts.upKey!.toLowerCase())) {
      this.moveUp(speed);
    }
    if (this._keys.has(opts.downKey!.toLowerCase())) {
      this.moveDown(speed);
    }

    // Rotation
    if (this._keys.has(opts.rotateLeftKey!.toLowerCase())) {
      this._camera.rotateY(rotSpeed);
    }
    if (this._keys.has(opts.rotateRightKey!.toLowerCase())) {
      this._camera.rotateY(-rotSpeed);
    }
    if (this._keys.has(opts.rotateUpKey!.toLowerCase())) {
      this._camera.rotateX(-rotSpeed);
    }
    if (this._keys.has(opts.rotateDownKey!.toLowerCase())) {
      this._camera.rotateX(rotSpeed);
    }
  }

  private moveForward(speed: number): void {
    const eye = this._camera.view.eye;
    const center = this._camera.view.center;
    const dx = center.data[0]! - eye.data[0]!;
    const dy = center.data[1]! - eye.data[1]!;
    const dz = center.data[2]! - eye.data[2]!;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len > 0.01) {
      this._camera.move((dx / len) * speed, (dy / len) * speed, (dz / len) * speed);
    }
  }

  private moveBackward(speed: number): void {
    const eye = this._camera.view.eye;
    const center = this._camera.view.center;
    const dx = eye.data[0]! - center.data[0]!;
    const dy = eye.data[1]! - center.data[1]!;
    const dz = eye.data[2]! - center.data[2]!;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len > 0.01) {
      this._camera.move((dx / len) * speed, (dy / len) * speed, (dz / len) * speed);
    }
  }

  private moveLeft(speed: number): void {
    const eye = this._camera.view.eye;
    const center = this._camera.view.center;
    const up = this._camera.view.up;

    const forward = new Vector3(new Float32Array([center.data[0]! - eye.data[0]!, center.data[1]! - eye.data[1]!, center.data[2]! - eye.data[2]!])).normalize();

    const right = forward.cross(up).normalize();
    this._camera.move(-right.data[0]! * speed, -right.data[1]! * speed, -right.data[2]! * speed);
  }

  private moveRight(speed: number): void {
    const eye = this._camera.view.eye;
    const center = this._camera.view.center;
    const up = this._camera.view.up;

    const forward = new Vector3(new Float32Array([center.data[0]! - eye.data[0]!, center.data[1]! - eye.data[1]!, center.data[2]! - eye.data[2]!])).normalize();

    const right = forward.cross(up).normalize();
    this._camera.move(right.data[0]! * speed, right.data[1]! * speed, right.data[2]! * speed);
  }

  private moveUp(speed: number): void {
    const up = this._camera.view.up;
    this._camera.move(up.data[0]! * speed, up.data[1]! * speed, up.data[2]! * speed);
  }

  private moveDown(speed: number): void {
    const up = this._camera.view.up;
    this._camera.move(-up.data[0]! * speed, -up.data[1]! * speed, -up.data[2]! * speed);
  }
}
