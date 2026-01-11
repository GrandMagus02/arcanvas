import type { Arcanvas } from "../Arcanvas";
import type { Camera } from "./Camera";
import type { CameraController, CameraControllerLike, CameraControllerOptions } from "./CameraController";

/**
 * Manager for camera controllers.
 * Allows multiple controllers to be attached to a single camera.
 */
export class CameraControllerManager {
  private _controllers = new Map<CameraControllerLike, CameraController>();
  private _camera: Camera;
  private _arcanvas: Arcanvas;

  constructor(camera: Camera, arcanvas: Arcanvas) {
    this._camera = camera;
    this._arcanvas = arcanvas;
  }

  /**
   * Add a controller to this camera.
   */
  use<T extends CameraControllerOptions = CameraControllerOptions>(
    ControllerClass: CameraControllerLike<T>,
    options?: T
  ): CameraController<T> {
    const controller = new ControllerClass(this._camera, this._arcanvas, (options ?? {}) as T);
    this._controllers.set(ControllerClass as CameraControllerLike, controller);
    if (controller.enabled) {
      controller.attach();
    }
    return controller;
  }

  /**
   * Get a controller by its class.
   */
  get<T extends CameraControllerOptions = CameraControllerOptions>(
    ControllerClass: CameraControllerLike<T>
  ): CameraController<T> | undefined {
    return this._controllers.get(ControllerClass as CameraControllerLike) as CameraController<T> | undefined;
  }

  /**
   * Remove a controller.
   */
  remove(ControllerClass: CameraControllerLike): void {
    const controller = this._controllers.get(ControllerClass);
    if (controller) {
      controller.detach();
      this._controllers.delete(ControllerClass);
    }
  }

  /**
   * Remove all controllers.
   */
  clear(): void {
    for (const controller of this._controllers.values()) {
      controller.detach();
    }
    this._controllers.clear();
  }

  /**
   * Update all controllers (for frame-based updates).
   */
  update(deltaTime: number): void {
    for (const controller of this._controllers.values()) {
      if (controller.enabled && controller.update) {
        controller.update(deltaTime);
      }
    }
  }
}

