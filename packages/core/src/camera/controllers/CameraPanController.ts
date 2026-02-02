import type { Camera } from "../Camera";
import type { CameraRig } from "../CameraRig";
import type { CameraInputState, ICameraController } from "../ICameraController";

/**
 * Options for configuring a CameraPanController.
 */
export interface CameraPanControllerOptions {
  /**
   * Pan sensitivity factor (default: 1.0).
   */
  panSensitivity?: number;

  /**
   * Invert Y axis for panning (default: false).
   */
  invertYAxis?: boolean;

  /**
   * Invert X axis for panning (default: false).
   */
  invertXAxis?: boolean;

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
}

const DEFAULT_OPTIONS: Required<CameraPanControllerOptions> = {
  panSensitivity: 1.0,
  invertYAxis: false,
  invertXAxis: false,
  panMouseButton: 0,
  panModifierKeys: [],
  cursorDefault: "default",
  cursorPanning: "grabbing",
  cursorDisabled: "default",
  cursorReady: "grab",
};

/**
 * Controller for camera panning via mouse drag.
 * Converts screen-space mouse movement to world-space camera translation.
 *
 * Priority: 50 (medium - processes after zoom but before keyboard)
 *
 * @example
 * ```typescript
 * const panController = new CameraPanController({
 *   panMouseButton: 0,
 *   panModifierKeys: "Space",
 *   panSensitivity: 1.0
 * });
 * rig.add(panController);
 * ```
 */
export class CameraPanController implements ICameraController {
  readonly id = "pan";
  readonly priority = 50;
  enabled = true;

  private _options: Required<CameraPanControllerOptions>;
  private _rig: CameraRig | null = null;
  private _isPanning = false;
  private _lastPointerPosition: { x: number; y: number } | null = null;
  private _requiredButtons: number[];
  private _requiredModifiers: string[];

  constructor(options: CameraPanControllerOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };

    // Normalize button configuration
    this._requiredButtons = Array.isArray(this._options.panMouseButton) ? this._options.panMouseButton : [this._options.panMouseButton];

    // Normalize modifier configuration
    this._requiredModifiers = Array.isArray(this._options.panModifierKeys) ? this._options.panModifierKeys : this._options.panModifierKeys ? [this._options.panModifierKeys] : [];
  }

  /**
   * Check if panning is currently active.
   */
  get isPanning(): boolean {
    return this._isPanning;
  }

  /**
   * Get pan sensitivity.
   */
  get panSensitivity(): number {
    return this._options.panSensitivity;
  }

  /**
   * Set pan sensitivity.
   */
  set panSensitivity(value: number) {
    this._options.panSensitivity = value;
  }

  onAttach(rig: CameraRig): void {
    this._rig = rig;
    this._updateCursor();
  }

  onDetach(): void {
    this._rig = null;
    this._isPanning = false;
    this._lastPointerPosition = null;
  }

  update(_dt: number, camera: Camera, input: CameraInputState): boolean {
    // Update cursor based on state
    this._updateCursor(input);

    const pointer = input.pointers.get(0);

    // Check for pan start
    if (!this._isPanning && pointer && pointer.buttons.length > 0) {
      if (this._checkPanConditions(pointer.buttons, input)) {
        this._isPanning = true;
        this._lastPointerPosition = { ...pointer.position };
        return false; // Don't consume on start - let other controllers see the state
      }
    }

    // Check for pan end
    if (this._isPanning) {
      if (!pointer || pointer.buttons.length === 0 || !this._checkPanConditions(pointer.buttons, input)) {
        this._isPanning = false;
        this._lastPointerPosition = null;
        return false;
      }
    }

    // Process panning
    if (this._isPanning && pointer && this._lastPointerPosition) {
      const deltaX = pointer.position.x - this._lastPointerPosition.x;
      const deltaY = pointer.position.y - this._lastPointerPosition.y;

      // Convert screen space delta to world space
      const canvas = camera.arcanvas?.canvas;
      if (canvas) {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        const proj = camera.projection;
        if (proj.left !== undefined && proj.right !== undefined && proj.top !== undefined && proj.bottom !== undefined) {
          const worldWidth = proj.right - proj.left;
          const worldHeight = proj.top - proj.bottom;

          // Convert mouse delta to world space translation
          // Base behavior: dragging right moves content right (camera left), dragging down moves content down (camera up)
          // invertXAxis: when TRUE, invert X direction
          // invertYAxis: when FALSE, invert Y direction (so default false = inverted Y)
          const xSign = this._options.invertXAxis ? 1 : -1;
          const ySign = this._options.invertYAxis ? -1 : 1;
          const worldDeltaX = ((xSign * deltaX) / width) * worldWidth * this._options.panSensitivity;
          const worldDeltaY = ((ySign * deltaY) / height) * worldHeight * this._options.panSensitivity;

          // Move camera position in 2D world space
          camera.move(worldDeltaX, worldDeltaY, 0);
        }
      }

      this._lastPointerPosition = { ...pointer.position };

      // Consume input while panning
      return true;
    }

    return false;
  }

  /**
   * Check if pan conditions are met (correct button and modifiers).
   */
  private _checkPanConditions(buttons: number[], input: CameraInputState): boolean {
    // Check if any of the required buttons are pressed
    const hasButton = this._requiredButtons.some((b) => buttons.includes(b));
    if (!hasButton) return false;

    // Check if required modifiers are pressed
    return this._checkModifiers(input);
  }

  /**
   * Check if required modifier keys are pressed.
   */
  private _checkModifiers(input: CameraInputState): boolean {
    if (this._requiredModifiers.length === 0) {
      return true; // No modifiers required
    }

    for (const modifier of this._requiredModifiers) {
      const normalized = modifier.toLowerCase();
      if (normalized === "shift" && !input.modifiers.shift) return false;
      if (normalized === "control" && !input.modifiers.ctrl) return false;
      if (normalized === "alt" && !input.modifiers.alt) return false;
      if (normalized === "meta" && !input.modifiers.meta) return false;
      if (normalized === "space" && !input.keysDown.has(" ")) return false;
    }

    return true;
  }

  /**
   * Update the canvas cursor based on current state.
   */
  private _updateCursor(input?: CameraInputState): void {
    if (!this._rig) return;

    const canvas = this._rig.canvas;
    if (!canvas) return;

    if (!this.enabled) {
      canvas.style.cursor = this._options.cursorDisabled;
      return;
    }

    if (this._isPanning) {
      canvas.style.cursor = this._options.cursorPanning;
      return;
    }

    // Check if panning is available (modifiers pressed)
    if (input && this._checkModifiers(input)) {
      canvas.style.cursor = this._options.cursorReady;
    } else {
      canvas.style.cursor = this._options.cursorDefault;
    }
  }
}
