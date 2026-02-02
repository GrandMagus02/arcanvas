import { EventKey } from "../../utils";
import type { Camera } from "../Camera";
import { CameraRig } from "../CameraRig";
import type { ICameraControllerLegacy } from "../ICameraController";
import { CameraKeyboardController, type CameraKeyboardControllerOptions } from "./CameraKeyboardController";
import { CameraPanController, type CameraPanControllerOptions } from "./CameraPanController";
import { CameraZoomController, type CameraZoomControllerOptions } from "./CameraZoomController";

/**
 * Options for configuring a Camera2DController.
 */
export interface Camera2DControllerOptions {
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
   * Pan sensitivity factor (default: 1.0).
   */
  panSensitivity?: number;
  /**
   * Invert Y axis for panning (default: false).
   */
  invertYAxis?: boolean;
  /**
   * Invert X axis for zooming (default: false).
   */
  invertXAxis?: boolean;
  /**
   * Keys that trigger upward movement (default: ["w", "W", "ArrowUp"]).
   */
  keysUp?: string[];
  /**
   * Keys that trigger downward movement (default: ["s", "S", "ArrowDown"]).
   */
  keysDown?: string[];
  /**
   * Keys that trigger leftward movement (default: ["a", "A", "ArrowLeft"]).
   */
  keysLeft?: string[];
  /**
   * Keys that trigger rightward movement (default: ["d", "D", "ArrowRight"]).
   */
  keysRight?: string[];
  /**
   * Base movement speed in world units per second (default: 100.0).
   * Movement is frame-rate independent.
   */
  keyboardMoveSpeed?: number;
  /**
   * Movement speed multiplier when Shift is held (default: 2.0).
   */
  shiftMultiplier?: number;
  /**
   * Movement speed multiplier when Ctrl is held (default: 0.5).
   */
  ctrlMultiplier?: number;
  /**
   * When true, mousemove and mouseup events are captured on the document
   * instead of the canvas, allowing panning to continue when the mouse
   * moves outside the canvas (default: true).
   */
  captureMouseOnDocument?: boolean;
  /**
   * Mouse button(s) required to trigger panning (default: 0 for left button).
   * 0 = left, 1 = middle, 2 = right, or array of buttons.
   */
  panMouseButton?: number | number[];
  /**
   * Modifier keys that must be pressed for panning to work (default: []).
   * Valid values: "Shift", "Control", "Alt", "Meta", "Space", or array of keys.
   */
  panModifierKeys?: string | string[];
  /**
   * Cursor style when controller is enabled but not panning (default: "default").
   */
  cursorDefault?: string;
  /**
   * Cursor style when panning is active (default: "grabbing").
   */
  cursorPanning?: string;
  /**
   * Cursor style when controller is disabled (default: "default").
   */
  cursorDisabled?: string;
  /**
   * Cursor style when panning is available but modifier keys are not pressed (default: "grab").
   */
  cursorReady?: string;
  /**
   * When true, if conflicting keys are pressed (e.g., both A and D),
   * the last pressed key takes precedence instead of canceling out (default: false).
   */
  useLastActiveKey?: boolean;
}

const DEFAULT_OPTIONS: Required<Camera2DControllerOptions> = {
  minZoom: 0.001,
  maxZoom: 10,
  zoomSensitivity: 0.01,
  panSensitivity: 1.0,
  invertYAxis: false,
  invertXAxis: false,
  keysUp: ["w", "W", "ArrowUp"],
  keysDown: ["s", "S", "ArrowDown"],
  keysLeft: ["a", "A", "ArrowLeft"],
  keysRight: ["d", "D", "ArrowRight"],
  keyboardMoveSpeed: 100.0,
  shiftMultiplier: 2.0,
  ctrlMultiplier: 0.5,
  captureMouseOnDocument: true,
  panMouseButton: 0,
  panModifierKeys: [],
  cursorDefault: "default",
  cursorPanning: "grabbing",
  cursorDisabled: "default",
  cursorReady: "grab",
  useLastActiveKey: false,
};

/**
 * 2D camera controller that provides pan (drag), zoom (wheel), and keyboard movement functionality.
 * Designed for 2D editors and pixel art applications using orthographic projection.
 *
 * This is a backward-compatible facade that internally uses CameraRig with individual controllers:
 * - CameraZoomController for wheel zoom and pinch gestures
 * - CameraPanController for mouse drag panning
 * - CameraKeyboardController for WASD/Arrow key movement
 *
 * For new code, consider using CameraRig directly with individual controllers for more flexibility.
 *
 * @example
 * ```typescript
 * // Legacy usage (still works)
 * const controller = new Camera2DController({ minZoom: 0.1, maxZoom: 10 });
 * controller.attach(camera);
 * controller.enable();
 *
 * // New recommended usage
 * const rig = new CameraRig(camera, {
 *   controllers: [
 *     new CameraZoomController({ minZoom: 0.1, maxZoom: 10 }),
 *     new CameraPanController({ panMouseButton: 0 }),
 *     new CameraKeyboardController({ keyboardMoveSpeed: 100 }),
 *   ]
 * });
 * ```
 */
export class Camera2DController implements ICameraControllerLegacy {
  private _camera: Camera | null = null;
  private _enabled: boolean = false;
  private _options: Required<Camera2DControllerOptions>;

  // Internal CameraRig and controllers
  private _rig: CameraRig | null = null;
  private _zoomController: CameraZoomController;
  private _panController: CameraPanController;
  private _keyboardController: CameraKeyboardController;

  // Resize handler binding
  private _boundResize: (width: number, height: number) => void;

  constructor(options: Camera2DControllerOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };

    // Create individual controllers with mapped options
    this._zoomController = new CameraZoomController(this._mapZoomOptions(this._options));
    this._panController = new CameraPanController(this._mapPanOptions(this._options));
    this._keyboardController = new CameraKeyboardController(this._mapKeyboardOptions(this._options));

    this._boundResize = this._handleResize.bind(this);
  }

  /**
   * Get the underlying CameraRig instance.
   * Useful for advanced customization or adding additional controllers.
   */
  get rig(): CameraRig | null {
    return this._rig;
  }

  /**
   * Get the zoom controller.
   */
  get zoomController(): CameraZoomController {
    return this._zoomController;
  }

  /**
   * Get the pan controller.
   */
  get panController(): CameraPanController {
    return this._panController;
  }

  /**
   * Get the keyboard controller.
   */
  get keyboardController(): CameraKeyboardController {
    return this._keyboardController;
  }

  attach(camera: Camera): void {
    this.detach();

    this._camera = camera;
    console.log("[Camera2DController] Attached to camera");

    // Create the CameraRig with individual controllers
    this._rig = new CameraRig(camera, {
      controllers: [this._zoomController, this._panController, this._keyboardController],
      enabled: false, // We'll enable it manually
      captureMouseOnDocument: this._options.captureMouseOnDocument,
    });

    // Listen to resize events
    if (camera.arcanvas) {
      camera.arcanvas.on(EventKey.Resize, this._boundResize);
    }

    if (this._enabled) {
      this._rig.enable();
    }
  }

  detach(): void {
    // Reset cursor before removing listeners
    const canvas = this._camera?.arcanvas?.canvas;
    if (canvas) {
      canvas.style.cursor = this._options.cursorDisabled;
    }

    if (this._rig) {
      this._rig.destroy();
      this._rig = null;
    }

    if (this._camera?.arcanvas) {
      this._camera.arcanvas.off(EventKey.Resize, this._boundResize);
    }

    if (this._camera) {
      console.log("[Camera2DController] Detached from camera");
    }
    this._camera = null;
  }

  // Legacy event handlers - these are no longer used internally but kept for interface compliance
  handleMouseDown(): void {
    // No-op: CameraRig handles this internally
  }

  handleMouseMove(): void {
    // No-op: CameraRig handles this internally
  }

  handleMouseUp(): void {
    // No-op: CameraRig handles this internally
  }

  handleWheel(): void {
    // No-op: CameraRig handles this internally
  }

  enable(): void {
    if (this._enabled) return;

    this._enabled = true;
    console.log("[Camera2DController] Enabled");

    if (this._rig) {
      this._rig.enable();
    }
  }

  disable(): void {
    if (!this._enabled) return;

    this._enabled = false;
    console.log("[Camera2DController] Disabled");

    if (this._rig) {
      this._rig.disable();
    }
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  /**
   * Get the current zoom level.
   */
  get zoom(): number {
    return this._zoomController.zoom;
  }

  /**
   * Set the zoom level programmatically.
   */
  set zoom(value: number) {
    this._zoomController.zoom = value;
  }

  // --- Private methods ---

  private _handleResize(): void {
    // Update zoom controller projection on resize
    this._zoomController.updateProjection();
  }

  private _mapZoomOptions(options: Camera2DControllerOptions): CameraZoomControllerOptions {
    return {
      minZoom: options.minZoom,
      maxZoom: options.maxZoom,
      zoomSensitivity: options.zoomSensitivity,
      initialZoom: 1.0,
    };
  }

  private _mapPanOptions(options: Camera2DControllerOptions): CameraPanControllerOptions {
    return {
      panSensitivity: options.panSensitivity,
      invertYAxis: options.invertYAxis,
      invertXAxis: options.invertXAxis,
      panMouseButton: options.panMouseButton,
      panModifierKeys: options.panModifierKeys,
      cursorDefault: options.cursorDefault,
      cursorPanning: options.cursorPanning,
      cursorDisabled: options.cursorDisabled,
      cursorReady: options.cursorReady,
    };
  }

  private _mapKeyboardOptions(options: Camera2DControllerOptions): CameraKeyboardControllerOptions {
    return {
      keysUp: options.keysUp,
      keysDown: options.keysDown,
      keysLeft: options.keysLeft,
      keysRight: options.keysRight,
      keyboardMoveSpeed: options.keyboardMoveSpeed,
      shiftMultiplier: options.shiftMultiplier,
      ctrlMultiplier: options.ctrlMultiplier,
      invertYAxis: options.invertYAxis,
      invertXAxis: options.invertXAxis,
      useLastActiveKey: options.useLastActiveKey,
    };
  }
}
