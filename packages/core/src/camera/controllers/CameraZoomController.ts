import type { Camera } from "../Camera";
import type { CameraRig } from "../CameraRig";
import type { CameraInputState, ICameraController } from "../ICameraController";
import { ProjectionMode } from "../../utils/ProjectionMode";

/**
 * Options for configuring a CameraZoomController.
 */
export interface CameraZoomControllerOptions {
  /**
   * Minimum zoom level (default: 0.001).
   */
  minZoom?: number;

  /**
   * Maximum zoom level (default: 10).
   */
  maxZoom?: number;

  /**
   * Zoom sensitivity factor (default: 0.01).
   */
  zoomSensitivity?: number;

  /**
   * Initial zoom level (default: 1.0).
   */
  initialZoom?: number;
}

const DEFAULT_OPTIONS: Required<CameraZoomControllerOptions> = {
  minZoom: 0.001,
  maxZoom: 10,
  zoomSensitivity: 0.01,
  initialZoom: 1.0,
};

/**
 * Controller for camera zooming via mouse wheel and pinch gestures.
 * Updates the camera's orthographic projection bounds based on zoom level.
 *
 * Priority: 100 (highest - processes wheel events before other controllers)
 *
 * @example
 * ```typescript
 * const zoomController = new CameraZoomController({
 *   minZoom: 0.1,
 *   maxZoom: 10,
 *   zoomSensitivity: 0.01
 * });
 * rig.add(zoomController);
 * ```
 */
export class CameraZoomController implements ICameraController {
  readonly id = "zoom";
  readonly priority = 100;
  enabled = true;

  private _options: Required<CameraZoomControllerOptions>;
  private _currentZoom: number;
  private _rig: CameraRig | null = null;

  constructor(options: CameraZoomControllerOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._currentZoom = this._options.initialZoom;
  }

  /**
   * Get the current zoom level.
   */
  get zoom(): number {
    return this._currentZoom;
  }

  /**
   * Set the zoom level programmatically.
   */
  set zoom(value: number) {
    const clampedZoom = Math.max(this._options.minZoom, Math.min(this._options.maxZoom, value));
    if (clampedZoom === this._currentZoom) return;

    this._currentZoom = clampedZoom;

    if (this._rig) {
      this._updateProjection(this._rig.camera);
    }
  }

  /**
   * Get the minimum zoom level.
   */
  get minZoom(): number {
    return this._options.minZoom;
  }

  /**
   * Set the minimum zoom level.
   */
  set minZoom(value: number) {
    this._options.minZoom = value;
    // Clamp current zoom if needed
    if (this._currentZoom < value) {
      this.zoom = value;
    }
  }

  /**
   * Get the maximum zoom level.
   */
  get maxZoom(): number {
    return this._options.maxZoom;
  }

  /**
   * Set the maximum zoom level.
   */
  set maxZoom(value: number) {
    this._options.maxZoom = value;
    // Clamp current zoom if needed
    if (this._currentZoom > value) {
      this.zoom = value;
    }
  }

  /**
   * Get zoom sensitivity.
   */
  get zoomSensitivity(): number {
    return this._options.zoomSensitivity;
  }

  /**
   * Set zoom sensitivity.
   */
  set zoomSensitivity(value: number) {
    this._options.zoomSensitivity = value;
  }

  onAttach(rig: CameraRig): void {
    this._rig = rig;
    // Initialize projection on attach
    this._updateProjection(rig.camera);
  }

  onDetach(): void {
    this._rig = null;
  }

  update(_dt: number, camera: Camera, input: CameraInputState): boolean {
    // Only process if we have wheel input
    if (!input.wheelDelta) {
      return false;
    }

    // Detect pinch gesture (Ctrl+Wheel on macOS/Linux, or use deltaZ for touchpad)
    const isPinchGesture = input.modifiers.ctrl || input.modifiers.meta || Math.abs(input.wheelDelta.z) > 0;

    // Adjust sensitivity based on deltaMode
    // deltaMode 0 = pixels (touchpad), 1 = lines (mouse wheel), 2 = pages
    let sensitivity = this._options.zoomSensitivity;
    if (input.wheelDelta.deltaMode === 0) {
      // Touchpad - use smaller sensitivity for pixel-based deltas
      sensitivity = this._options.zoomSensitivity * 0.1;
    } else if (input.wheelDelta.deltaMode === 1) {
      // Mouse wheel - standard sensitivity
      sensitivity = this._options.zoomSensitivity;
    }

    // For pinch gestures, use deltaZ if available, otherwise deltaY
    const delta = isPinchGesture && Math.abs(input.wheelDelta.z) > 0 ? input.wheelDelta.z : input.wheelDelta.y;

    // Calculate zoom factor using exponential zooming for linear visual scaling
    // newZoom = currentZoom * exp(-delta * sensitivity)
    const zoomScale = Math.exp(-delta * sensitivity);
    const newZoom = Math.max(this._options.minZoom, Math.min(this._options.maxZoom, this._currentZoom * zoomScale));

    if (newZoom === this._currentZoom) {
      // Zoom clamped, still consume the input
      return true;
    }

    this._currentZoom = newZoom;
    this._updateProjection(camera);

    // Consume input - wheel events shouldn't propagate to other controllers
    return true;
  }

  /**
   * Update the camera projection with current zoom and canvas dimensions.
   */
  private _updateProjection(camera: Camera): void {
    const canvas = camera.arcanvas?.canvas;
    if (!canvas) {
      // Fallback if no canvas available
      camera.projection.update({
        mode: ProjectionMode.Orthographic,
        left: -100,
        right: 100,
        top: 100,
        bottom: -100,
        near: -1000,
        far: 1000,
      } as unknown as Parameters<typeof camera.projection.update>[0]);
      return;
    }

    // Ensure we have a valid zoom level
    if (this._currentZoom === 0 || !Number.isFinite(this._currentZoom)) {
      this._currentZoom = 0.1;
    }

    const aspect = canvas.width / canvas.height;
    const ppu = camera.pixelsPerUnit;
    const halfHeight = canvas.height / (2 * this._currentZoom * ppu);

    camera.projection.update({
      mode: ProjectionMode.Orthographic,
      left: -halfHeight * aspect,
      right: halfHeight * aspect,
      top: halfHeight,
      bottom: -halfHeight,
      near: -1000,
      far: 1000,
    } as unknown as Parameters<typeof camera.projection.update>[0]);
  }

  /**
   * Force a projection update (e.g., after canvas resize).
   */
  updateProjection(): void {
    if (this._rig) {
      this._updateProjection(this._rig.camera);
    }
  }
}
