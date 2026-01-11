import type { Arcanvas } from "../../Arcanvas";
import type { Camera } from "../Camera";
import { CameraController, type CameraControllerOptions } from "../CameraController";

/**
 * Options for OrbitController.
 */
export interface OrbitControllerOptions extends CameraControllerOptions {
  /** Mouse button for orbit rotation (0 = left, 1 = middle, 2 = right) */
  mouseButton?: number;
  /** Rotation speed multiplier */
  rotationSpeed?: number;
  /** Pan speed multiplier */
  panSpeed?: number;
  /** Zoom speed multiplier */
  zoomSpeed?: number;
  /** Enable panning with right mouse button */
  enablePan?: boolean;
  /** Enable zoom with mouse wheel */
  enableZoom?: boolean;
}

/**
 * Controller for mouse-based orbit, pan, and zoom.
 */
export class OrbitController extends CameraController<OrbitControllerOptions> {
  private _isMouseDown = false;
  private _mouseButton = 0;
  private _lastMouseX = 0;
  private _lastMouseY = 0;
  private _mousedownHandler?: (e: MouseEvent) => void;
  private _mouseupHandler?: (e: MouseEvent) => void;
  private _mouseleaveHandler?: () => void;
  private _mousemoveHandler?: (e: MouseEvent) => void;
  private _wheelHandler?: (e: WheelEvent) => void;
  private _contextmenuHandler?: (e: MouseEvent) => void;

  constructor(camera: Camera, arcanvas: Arcanvas, options: OrbitControllerOptions = {}) {
    super(camera, arcanvas, {
      mouseButton: 0,
      rotationSpeed: 0.01,
      panSpeed: 0.01,
      zoomSpeed: 0.1,
      enablePan: true,
      enableZoom: true,
      ...options,
    });
  }

  attach(): void {
    const canvas = this._arcanvas.canvas;

    this._mousedownHandler = (e: MouseEvent) => {
      this._isMouseDown = true;
      this._mouseButton = e.button;
      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
      canvas.style.cursor = this._mouseButton === 0 ? "grabbing" : "move";
    };

    this._mouseupHandler = () => {
      this._isMouseDown = false;
      canvas.style.cursor = "default";
    };

    this._mouseleaveHandler = () => {
      this._isMouseDown = false;
      canvas.style.cursor = "default";
    };

    this._mousemoveHandler = (e: MouseEvent) => {
      if (!this._isMouseDown) return;

      const dx = e.clientX - this._lastMouseX;
      const dy = e.clientY - this._lastMouseY;

      const opts = this._options;
      if (this._mouseButton === opts.mouseButton) {
        // Orbit rotation
        this._camera.rotateY(-dx * (opts.rotationSpeed ?? 0.01));
        this._camera.rotateX(-dy * (opts.rotationSpeed ?? 0.01));
      } else if (this._mouseButton === 2 && opts.enablePan) {
        // Right button: Pan
        const panSpeed = (opts.panSpeed ?? 0.01) * 0.01;
        this._camera.move(-dx * panSpeed, dy * panSpeed, 0);
      }

      this._lastMouseX = e.clientX;
      this._lastMouseY = e.clientY;
    };

    this._wheelHandler = (e: WheelEvent) => {
      if (!this._options.enableZoom) return;

      e.preventDefault();
      const opts = this._options;
      const zoomSpeed = opts.zoomSpeed ?? 0.1;
      const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed;

      // Calculate current distance from center
      const eye = this._camera.view.eye;
      const center = this._camera.view.center;
      const dx = eye.data[0]! - center.data[0]!;
      const dy = eye.data[1]! - center.data[1]!;
      const dz = eye.data[2]! - center.data[2]!;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (distance > 0.01) {
        // Move eye along view direction
        const dirX = dx / distance;
        const dirY = dy / distance;
        const dirZ = dz / distance;
        this._camera.move(dirX * delta, dirY * delta, dirZ * delta);
      }
    };

    this._contextmenuHandler = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("mousedown", this._mousedownHandler);
    canvas.addEventListener("mouseup", this._mouseupHandler);
    canvas.addEventListener("mouseleave", this._mouseleaveHandler);
    canvas.addEventListener("mousemove", this._mousemoveHandler);
    canvas.addEventListener("wheel", this._wheelHandler);
    canvas.addEventListener("contextmenu", this._contextmenuHandler);
  }

  detach(): void {
    const canvas = this._arcanvas.canvas;

    if (this._mousedownHandler) {
      canvas.removeEventListener("mousedown", this._mousedownHandler);
      this._mousedownHandler = undefined;
    }
    if (this._mouseupHandler) {
      canvas.removeEventListener("mouseup", this._mouseupHandler);
      this._mouseupHandler = undefined;
    }
    if (this._mouseleaveHandler) {
      canvas.removeEventListener("mouseleave", this._mouseleaveHandler);
      this._mouseleaveHandler = undefined;
    }
    if (this._mousemoveHandler) {
      canvas.removeEventListener("mousemove", this._mousemoveHandler);
      this._mousemoveHandler = undefined;
    }
    if (this._wheelHandler) {
      canvas.removeEventListener("wheel", this._wheelHandler);
      this._wheelHandler = undefined;
    }
    if (this._contextmenuHandler) {
      canvas.removeEventListener("contextmenu", this._contextmenuHandler);
      this._contextmenuHandler = undefined;
    }

    this._isMouseDown = false;
    canvas.style.cursor = "default";
  }
}
