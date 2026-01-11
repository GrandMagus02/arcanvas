import type { Arcanvas } from "../Arcanvas";
import type { Camera } from "./Camera";

/**
 * Options interface for camera controllers.
 */
export interface CameraControllerOptions {
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Base class for camera controllers.
 * Controllers handle input and translate it to camera movements.
 */
export abstract class CameraController<T extends CameraControllerOptions = CameraControllerOptions> {
  protected _camera: Camera;
  protected _arcanvas: Arcanvas;
  protected _options: T;
  protected _enabled: boolean = true;

  constructor(camera: Camera, arcanvas: Arcanvas, options: T) {
    this._camera = camera;
    this._arcanvas = arcanvas;
    this._options = { enabled: true, ...options } as T;
    this._enabled = this._options.enabled ?? true;
  }

  get camera(): Camera {
    return this._camera;
  }

  get arcanvas(): Arcanvas {
    return this._arcanvas;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    if (value) {
      this.attach();
    } else {
      this.detach();
    }
  }

  /**
   * Attach event listeners and set up the controller.
   * Called automatically when controller is enabled.
   */
  abstract attach(): void;

  /**
   * Detach event listeners and clean up.
   * Called automatically when controller is disabled.
   */
  abstract detach(): void;

  /**
   * Update the controller (called each frame if needed).
   * Override for frame-based updates.
   */
  update?(_deltaTime: number): void;
}

/**
 * A type that represents a camera controller class.
 */
export type CameraControllerLike<T extends CameraControllerOptions = CameraControllerOptions> = 
  new (camera: Camera, arcanvas: Arcanvas, options: T) => CameraController<T>;

