import { EventKey } from "../../utils";
import { ProjectionMode } from "../../utils/ProjectionMode";
import type { Camera } from "../Camera";
import type { ICameraController } from "../ICameraController";

/**
 * Options for configuring a Camera2DController.
 */
export interface Camera2DControllerOptions {
  /**
   * Minimum zoom level (default: 0.1).
   */
  minZoom?: number;
  /**
   * Maximum zoom level (default: 10).
   */
  maxZoom?: number;
  /**
   * Zoom sensitivity factor (default: 0.001).
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
   * moves outside the canvas (default: false).
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
 * 2D camera controller that provides pan (drag) and zoom (wheel) functionality.
 * Designed for 2D editors and pixel art applications using orthographic projection.
 */
export class Camera2DController implements ICameraController {
  private _camera: Camera | null = null;
  private _enabled: boolean = false;
  private _isPanning: boolean = false;
  private _lastMouseX: number = 0;
  private _lastMouseY: number = 0;
  private _options: Required<Camera2DControllerOptions>;
  private _currentZoom: number = 1.0;

  // Keyboard state
  private _pressedKeys: Set<string> = new Set();
  private _keyboardUpdateRafId: number | null = null;
  private _lastKeyboardUpdateTime: number = 0;
  private _shiftPressed: boolean = false;
  private _ctrlPressed: boolean = false;
  // Track last active key for each direction (for useLastActiveKey option)
  private _lastActiveKeyLeft: string | null = null;
  private _lastActiveKeyRight: string | null = null;
  private _lastActiveKeyUp: string | null = null;
  private _lastActiveKeyDown: string | null = null;
  // Track when each direction key was last pressed (for useLastActiveKey option)
  private _lastActiveTimeLeft: number = 0;
  private _lastActiveTimeRight: number = 0;
  private _lastActiveTimeUp: number = 0;
  private _lastActiveTimeDown: number = 0;

  // Document mouse capture state
  private _documentMouseListenersAttached: boolean = false;

  // Modifier key tracking for panning
  private _requiredModifiersPressed: boolean = false;

  // Bound event handlers to allow removal
  private _boundMouseDown: (e: MouseEvent) => void;
  private _boundMouseMove: (e: MouseEvent) => void;
  private _boundMouseUp: (e: MouseEvent) => void;
  private _boundWheel: (e: WheelEvent) => void;
  private _boundResize: (width: number, height: number) => void;
  private _boundKeyDown: (e: KeyboardEvent) => void;
  private _boundKeyUp: (e: KeyboardEvent) => void;
  private _boundKeyboardUpdate: () => void;
  private _boundBlur: () => void;

  constructor(options: Camera2DControllerOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._boundMouseDown = this.handleMouseDown.bind(this);
    this._boundMouseMove = this.handleMouseMove.bind(this);
    this._boundMouseUp = this.handleMouseUp.bind(this);
    this._boundWheel = this.handleWheel.bind(this);
    this._boundResize = this.handleResize.bind(this);
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp = this.handleKeyUp.bind(this);
    this._boundKeyboardUpdate = this._updateKeyboardMovement.bind(this);
    this._boundBlur = this.handleBlur.bind(this);
  }

  attach(camera: Camera): void {
    this.detach();

    this._camera = camera;
    console.log("[Camera2DController] Attached to camera");

    // Listen to resize events to update projection bounds
    if (camera.arcanvas) {
      camera.arcanvas.on(EventKey.Resize, this._boundResize);
    }

    // Update projection with current canvas size
    this._updateProjection();

    if (this._enabled) {
      this._attachEventListeners();
      this._updateCursor();
    }

    // Log viewport state after attachment and projection setup
    this._logViewportState("attach");
  }

  detach(): void {
    // Reset cursor before removing listeners
    const canvas = this._camera?.arcanvas?.canvas;
    if (canvas) {
      canvas.style.cursor = this._options.cursorDisabled;
    }

    this._removeEventListeners();
    this._stopKeyboardUpdate();
    // Ensure document listeners are removed
    if (this._documentMouseListenersAttached) {
      this._removeDocumentMouseListeners();
    }
    if (this._camera?.arcanvas) {
      this._camera.arcanvas.off(EventKey.Resize, this._boundResize);
    }
    if (this._camera) {
      console.log("[Camera2DController] Detached from camera");
    }
    this._camera = null;
    this._isPanning = false;
    this._pressedKeys.clear();
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._lastActiveKeyLeft = null;
    this._lastActiveKeyRight = null;
    this._lastActiveKeyUp = null;
    this._lastActiveKeyDown = null;
    this._lastActiveTimeLeft = 0;
    this._lastActiveTimeRight = 0;
    this._lastActiveTimeUp = 0;
    this._lastActiveTimeDown = 0;
  }

  handleMouseDown(event: MouseEvent): void {
    if (!this._camera || !this._enabled) return;

    // Check if the correct mouse button is pressed
    const requiredButtons = Array.isArray(this._options.panMouseButton) ? this._options.panMouseButton : [this._options.panMouseButton];
    if (!requiredButtons.includes(event.button)) {
      return;
    }

    // Check if required modifier keys are pressed
    if (!this._checkPanModifiers(event)) {
      this._updateCursor();
      return;
    }

    this._isPanning = true;
    this._lastMouseX = event.clientX;
    this._lastMouseY = event.clientY;
    console.log("[Camera2DController] Pan started", { x: event.clientX, y: event.clientY });

    // Update cursor to panning state
    this._updateCursor();

    // If document capture is enabled, attach mousemove and mouseup to document
    if (this._options.captureMouseOnDocument) {
      this._attachDocumentMouseListeners();
    }

    event.preventDefault();
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this._camera || !this._enabled) return;

    // Update cursor on mouse move if not panning
    if (!this._isPanning) {
      this._updateCursor();
    }

    if (!this._isPanning) return;

    const deltaX = event.clientX - this._lastMouseX;
    const deltaY = event.clientY - this._lastMouseY;

    // Convert screen space delta to world space
    // For orthographic projection, we need to account for the current view size
    const canvas = this._camera.arcanvas?.canvas;
    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Calculate world space delta based on current projection bounds
    const proj = this._camera.projection;
    if (proj.left === undefined || proj.right === undefined || proj.top === undefined || proj.bottom === undefined) return;

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

    // Move camera position in 2D world space (translation only, no rotation)
    this._camera.move(worldDeltaX, worldDeltaY, 0);
    console.log("[Camera2DController] Pan move", {
      screenDelta: { x: deltaX, y: deltaY },
      worldDelta: { x: worldDeltaX, y: worldDeltaY },
      worldSize: { width: worldWidth, height: worldHeight },
      projectionBounds: {
        left: proj.left,
        right: proj.right,
        top: proj.top,
        bottom: proj.bottom,
      },
    });
    this._logViewportState("pan");

    this._lastMouseX = event.clientX;
    this._lastMouseY = event.clientY;
    event.preventDefault();
  }

  handleMouseUp(event: MouseEvent): void {
    if (!this._enabled) return;

    this._isPanning = false;
    console.log("[Camera2DController] Pan ended");

    // Update cursor back to ready/default state
    this._updateCursor();

    // Remove document listeners if they were attached
    if (this._documentMouseListenersAttached) {
      this._removeDocumentMouseListeners();
    }

    event.preventDefault();
  }

  /**
   * Handle canvas resize events and update projection bounds.
   */
  private handleResize(_width: number, _height: number): void {
    void _width;
    void _height;
    if (!this._camera) return;
    // Update projection bounds based on current zoom and new canvas size
    // Canvas dimensions are read directly from canvas in _updateProjection()
    this._updateProjection();
  }

  /**
   * Update the camera projection with current zoom and canvas dimensions.
   */
  private _updateProjection(): void {
    if (!this._camera) return;

    const canvas = this._camera.arcanvas?.canvas;
    if (!canvas) {
      // Fallback if no canvas available
      this._currentZoom = 0.1;
      this._camera.projection.update({
        mode: ProjectionMode.Orthographic,
        left: -100,
        right: 100,
        top: 100,
        bottom: -100,
        near: -1000,
        far: 1000,
      } as unknown as Parameters<typeof this._camera.projection.update>[0]);
      return;
    }

    // Ensure we have a valid zoom level
    if (this._currentZoom === 0 || !Number.isFinite(this._currentZoom)) {
      this._currentZoom = 0.1;
    }

    const aspect = canvas.width / canvas.height;
    const ppu = this._camera.pixelsPerUnit;
    const halfHeight = canvas.height / (2 * this._currentZoom * ppu);

    this._camera.projection.update({
      mode: ProjectionMode.Orthographic,
      left: -halfHeight * aspect,
      right: halfHeight * aspect,
      top: halfHeight,
      bottom: -halfHeight,
      near: -1000,
      far: 1000,
    } as unknown as Parameters<typeof this._camera.projection.update>[0]);
  }

  handleWheel(event: WheelEvent): void {
    console.log("[Camera2DController] Wheel event received", {
      deltaY: event.deltaY,
      deltaX: event.deltaX,
      deltaZ: event.deltaZ,
      deltaMode: event.deltaMode, // 0 = pixels, 1 = lines, 2 = pages
      ctrlKey: event.ctrlKey, // Pinch gesture on macOS
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      camera: !!this._camera,
      enabled: this._enabled,
      currentZoom: this._currentZoom,
    });

    if (!this._camera || !this._enabled) {
      console.log("[Camera2DController] Wheel ignored - camera or enabled check failed");
      return;
    }

    // Detect pinch gesture (Ctrl+Wheel on macOS/Linux, or use deltaMode for touchpad)
    // On macOS, pinch gestures often come with ctrlKey=true
    const isPinchGesture = event.ctrlKey || event.metaKey || Math.abs(event.deltaZ) > 0;

    // Adjust sensitivity based on deltaMode
    // deltaMode 0 = pixels (touchpad), 1 = lines (mouse wheel), 2 = pages
    let sensitivity = this._options.zoomSensitivity;
    if (event.deltaMode === 0) {
      // Touchpad - use smaller sensitivity for pixel-based deltas
      sensitivity = this._options.zoomSensitivity * 0.1;
    } else if (event.deltaMode === 1) {
      // Mouse wheel - standard sensitivity
      sensitivity = this._options.zoomSensitivity;
    }

    // For pinch gestures, use deltaZ if available, otherwise deltaY
    const delta = isPinchGesture && Math.abs(event.deltaZ) > 0 ? event.deltaZ : event.deltaY;

    // Calculate zoom factor
    // Use exponential zooming for linear visual scaling
    // newZoom = currentZoom * exp(-delta * sensitivity)
    const zoomScale = Math.exp(-delta * sensitivity);
    const newZoom = Math.max(this._options.minZoom, Math.min(this._options.maxZoom, this._currentZoom * zoomScale));

    if (newZoom === this._currentZoom) {
      console.log("[Camera2DController] Zoom clamped", {
        delta,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        zoomScale,
        currentZoom: this._currentZoom,
        newZoom,
        minZoom: this._options.minZoom,
        maxZoom: this._options.maxZoom,
        isPinchGesture,
      });
      return;
    }

    const oldZoom = this._currentZoom;
    this._currentZoom = newZoom;

    // Update projection bounds based on zoom
    this._updateProjection();

    const canvas = this._camera.arcanvas?.canvas;
    if (canvas) {
      const aspect = canvas.width / canvas.height;
      const ppu = this._camera.pixelsPerUnit;
      const halfHeight = canvas.height / (2 * this._currentZoom * ppu);

      console.log("[Camera2DController] Zoom", {
        delta,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        deltaMode: event.deltaMode,
        isPinchGesture,
        sensitivity,
        zoomScale,
        oldZoom,
        newZoom,
        halfHeight,
        projection: {
          left: -halfHeight * aspect,
          right: halfHeight * aspect,
          top: halfHeight,
          bottom: -halfHeight,
        },
      });
    }

    event.preventDefault();
  }

  enable(): void {
    if (this._enabled) return;

    this._enabled = true;
    console.log("[Camera2DController] Enabled");
    if (this._camera) {
      this._attachEventListeners();
      this._updateCursor();
    }
  }

  disable(): void {
    if (!this._enabled) return;

    this._enabled = false;
    console.log("[Camera2DController] Disabled");
    this._removeEventListeners();
    this._stopKeyboardUpdate();
    // Ensure document listeners are removed
    if (this._documentMouseListenersAttached) {
      this._removeDocumentMouseListeners();
    }
    this._isPanning = false;
    this._pressedKeys.clear();
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._lastActiveKeyLeft = null;
    this._lastActiveKeyRight = null;
    this._lastActiveKeyUp = null;
    this._lastActiveKeyDown = null;
    this._lastActiveTimeLeft = 0;
    this._lastActiveTimeRight = 0;
    this._lastActiveTimeUp = 0;
    this._lastActiveTimeDown = 0;
    this._updateCursor();
  }

  isEnabled(): boolean {
    return this._enabled;
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

    if (!this._camera) return;

    // Update projection bounds
    this._updateProjection();
  }

  private _attachEventListeners(): void {
    const canvas = this._camera?.arcanvas?.canvas;
    if (!canvas) return;

    canvas.addEventListener("mousedown", this._boundMouseDown);
    // Always attach mousemove to canvas for cursor updates (even if document capture is enabled)
    canvas.addEventListener("mousemove", this._boundMouseMove);
    // Only attach mouseup to canvas if document capture is disabled
    // If document capture is enabled, mouseup will be attached to document on mousedown
    if (!this._options.captureMouseOnDocument) {
      canvas.addEventListener("mouseup", this._boundMouseUp);
    }
    // Use { passive: false } to allow preventDefault() for zoom
    // This is important for touchpad gestures
    canvas.addEventListener("wheel", this._boundWheel, { passive: false });

    // Keyboard events - attach to window to capture keys even when canvas doesn't have focus
    window.addEventListener("keydown", this._boundKeyDown);
    window.addEventListener("keyup", this._boundKeyUp);
    // Handle window blur to clear stuck keys
    window.addEventListener("blur", this._boundBlur);

    // Also listen for gesture events on Safari/WebKit (if available)
    if ("GestureEvent" in window) {
      interface GestureEvent extends Event {
        scale?: number;
        rotation?: number;
      }
      canvas.addEventListener("gesturestart", (e: Event) => {
        e.preventDefault();
        console.log("[Camera2DController] Gesture start");
      });
      canvas.addEventListener("gesturechange", (e: Event) => {
        e.preventDefault();
        const gestureEvent = e as GestureEvent;
        console.log("[Camera2DController] Gesture change", { scale: gestureEvent.scale });
      });
      canvas.addEventListener("gestureend", (e: Event) => {
        e.preventDefault();
        console.log("[Camera2DController] Gesture end");
      });
    }
  }

  private _removeEventListeners(): void {
    const canvas = this._camera?.arcanvas?.canvas;
    if (!canvas) return;

    canvas.removeEventListener("mousedown", this._boundMouseDown);
    // Always remove mousemove from canvas (used for cursor updates)
    canvas.removeEventListener("mousemove", this._boundMouseMove);
    // Only remove mouseup from canvas if document capture is disabled
    if (!this._options.captureMouseOnDocument) {
      canvas.removeEventListener("mouseup", this._boundMouseUp);
    }
    canvas.removeEventListener("wheel", this._boundWheel);

    window.removeEventListener("keydown", this._boundKeyDown);
    window.removeEventListener("keyup", this._boundKeyUp);
    window.removeEventListener("blur", this._boundBlur);

    // Clean up document listeners if they exist
    if (this._documentMouseListenersAttached) {
      this._removeDocumentMouseListeners();
    }
  }

  /**
   * Attach mousemove and mouseup listeners to the document.
   * Used when captureMouseOnDocument is enabled to allow panning
   * to continue when the mouse moves outside the canvas.
   */
  private _attachDocumentMouseListeners(): void {
    if (this._documentMouseListenersAttached) return;

    document.addEventListener("mousemove", this._boundMouseMove);
    document.addEventListener("mouseup", this._boundMouseUp);
    this._documentMouseListenersAttached = true;
  }

  /**
   * Remove mousemove and mouseup listeners from the document.
   */
  private _removeDocumentMouseListeners(): void {
    if (!this._documentMouseListenersAttached) return;

    document.removeEventListener("mousemove", this._boundMouseMove);
    document.removeEventListener("mouseup", this._boundMouseUp);
    this._documentMouseListenersAttached = false;
  }

  /**
   * Check if required pan modifier keys are pressed.
   */
  private _checkPanModifiers(event?: MouseEvent | KeyboardEvent): boolean {
    const requiredModifiers = Array.isArray(this._options.panModifierKeys) ? this._options.panModifierKeys : this._options.panModifierKeys ? [this._options.panModifierKeys] : [];

    if (requiredModifiers.length === 0) {
      return true; // No modifiers required
    }

    // Check modifiers from event if provided, otherwise use tracked state
    if (event) {
      const shift = event.shiftKey;
      const ctrl = event.ctrlKey || event.metaKey;
      const alt = event.altKey;
      const space = (event instanceof KeyboardEvent && event.key === " ") || this._pressedKeys.has(" ");

      for (const modifier of requiredModifiers) {
        const normalized = modifier.toLowerCase();
        if (normalized === "shift" && !shift) return false;
        if (normalized === "control" && !ctrl) return false;
        if (normalized === "alt" && !alt) return false;
        if (normalized === "meta" && !ctrl) return false;
        if (normalized === "space" && !space) return false;
      }
    } else {
      // Use tracked state
      for (const modifier of requiredModifiers) {
        const normalized = modifier.toLowerCase();
        if (normalized === "shift" && !this._shiftPressed) return false;
        if (normalized === "control" && !this._ctrlPressed) return false;
        if (normalized === "space" && !this._pressedKeys.has(" ")) return false;
        // Alt and Meta need to be tracked separately if needed
      }
    }

    return true;
  }

  /**
   * Update canvas cursor based on current state.
   */
  private _updateCursor(): void {
    const canvas = this._camera?.arcanvas?.canvas;
    if (!canvas) return;

    if (!this._enabled) {
      canvas.style.cursor = this._options.cursorDisabled;
      return;
    }

    if (this._isPanning) {
      canvas.style.cursor = this._options.cursorPanning;
      return;
    }

    // Check if panning is available (modifiers pressed)
    const modifiersOk = this._checkPanModifiers();
    if (modifiersOk) {
      canvas.style.cursor = this._options.cursorReady;
    } else {
      canvas.style.cursor = this._options.cursorDefault;
    }
  }

  /**
   * Handle keyboard key down event.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this._camera || !this._enabled) return;

    const key = event.key;

    // Track modifier keys
    if (key === "Shift" || key === "ShiftLeft" || key === "ShiftRight") {
      this._shiftPressed = true;
      this._updateCursor();
      return;
    }
    if (key === "Control" || key === "ControlLeft" || key === "ControlRight" || key === "Meta") {
      this._ctrlPressed = true;
      this._updateCursor();
      return;
    }
    // Track Space key for panning modifier
    if (key === " ") {
      this._pressedKeys.add(" ");
      this._updateCursor();
      // Don't prevent default for space if it's just a modifier
      return;
    }

    const isMovementKey = this._options.keysUp.includes(key) || this._options.keysDown.includes(key) || this._options.keysLeft.includes(key) || this._options.keysRight.includes(key);

    if (isMovementKey) {
      // Only prevent default if it's a movement key and we're handling it
      // Don't prevent default for modifier keys (Shift, Ctrl, etc.)
      // Check if key is already pressed (handle case-insensitive matching)
      const keyAlreadyPressed = Array.from(this._pressedKeys).some((pressedKey) => pressedKey.toLowerCase() === key.toLowerCase());
      if (!keyAlreadyPressed) {
        this._pressedKeys.add(key);
        // Track last active key for each direction (if useLastActiveKey is enabled)
        if (this._options.useLastActiveKey) {
          const now = performance.now();
          if (this._options.keysLeft.includes(key)) {
            this._lastActiveKeyLeft = key;
            this._lastActiveTimeLeft = now;
          }
          if (this._options.keysRight.includes(key)) {
            this._lastActiveKeyRight = key;
            this._lastActiveTimeRight = now;
          }
          if (this._options.keysUp.includes(key)) {
            this._lastActiveKeyUp = key;
            this._lastActiveTimeUp = now;
          }
          if (this._options.keysDown.includes(key)) {
            this._lastActiveKeyDown = key;
            this._lastActiveTimeDown = now;
          }
        }
        // Update modifier state from event
        this._shiftPressed = event.shiftKey;
        this._ctrlPressed = event.ctrlKey || event.metaKey;
        this._startKeyboardUpdate();
      }
      // Only prevent default if we're actually handling the key
      // This allows other keys to work normally
      event.preventDefault();
    }
  }

  /**
   * Handle window blur event - clear all pressed keys to prevent stuck keys.
   */
  private handleBlur(): void {
    // Clear all pressed keys when window loses focus
    // This prevents keys from getting stuck if keyup events don't fire
    this._pressedKeys.clear();
    this._shiftPressed = false;
    this._ctrlPressed = false;
    this._stopKeyboardUpdate();
    // Clear last active keys
    this._lastActiveKeyLeft = null;
    this._lastActiveKeyRight = null;
    this._lastActiveKeyUp = null;
    this._lastActiveKeyDown = null;
    this._lastActiveTimeLeft = 0;
    this._lastActiveTimeRight = 0;
    this._lastActiveTimeUp = 0;
    this._lastActiveTimeDown = 0;
    this._updateCursor();
  }

  /**
   * Handle keyboard key up event.
   */
  private handleKeyUp(event: KeyboardEvent): void {
    if (!this._enabled) return;

    const key = event.key;

    // Track modifier keys
    if (key === "Shift" || key === "ShiftLeft" || key === "ShiftRight") {
      this._shiftPressed = false;
      this._updateCursor();
      return;
    }
    if (key === "Control" || key === "ControlLeft" || key === "ControlRight" || key === "Meta") {
      this._ctrlPressed = false;
      this._updateCursor();
      return;
    }
    // Find and remove the key (handle case-insensitive matching)
    // Sometimes keydown and keyup events have different cases (e.g., "A" vs "a")
    // Also handle Space key which is always " " but might be stored differently
    let keyToRemove: string | null = null;
    for (const pressedKey of this._pressedKeys) {
      if (pressedKey.toLowerCase() === key.toLowerCase() || (key === " " && pressedKey === " ")) {
        keyToRemove = pressedKey;
        break;
      }
    }

    if (keyToRemove !== null) {
      this._pressedKeys.delete(keyToRemove);
      // Clear last active key for this direction if it's the one being released
      if (this._options.useLastActiveKey) {
        if (this._lastActiveKeyLeft === keyToRemove) {
          this._lastActiveKeyLeft = null;
          this._lastActiveTimeLeft = 0;
        }
        if (this._lastActiveKeyRight === keyToRemove) {
          this._lastActiveKeyRight = null;
          this._lastActiveTimeRight = 0;
        }
        if (this._lastActiveKeyUp === keyToRemove) {
          this._lastActiveKeyUp = null;
          this._lastActiveTimeUp = 0;
        }
        if (this._lastActiveKeyDown === keyToRemove) {
          this._lastActiveKeyDown = null;
          this._lastActiveTimeDown = 0;
        }
      }
      // Update modifier state from event
      this._shiftPressed = event.shiftKey;
      this._ctrlPressed = event.ctrlKey || event.metaKey;
      if (this._pressedKeys.size === 0) {
        this._stopKeyboardUpdate();
      }
    }
  }

  /**
   * Start the keyboard movement update loop.
   */
  private _startKeyboardUpdate(): void {
    if (this._keyboardUpdateRafId !== null) return; // Already running

    this._lastKeyboardUpdateTime = performance.now();
    this._keyboardUpdateRafId = requestAnimationFrame(this._boundKeyboardUpdate);
  }

  /**
   * Stop the keyboard movement update loop.
   */
  private _stopKeyboardUpdate(): void {
    if (this._keyboardUpdateRafId !== null) {
      cancelAnimationFrame(this._keyboardUpdateRafId);
      this._keyboardUpdateRafId = null;
    }
  }

  /**
   * Check if a key is currently pressed (case-insensitive).
   */
  private _isKeyPressed(key: string): boolean {
    const keyLower = key.toLowerCase();
    return Array.from(this._pressedKeys).some((pressedKey) => pressedKey.toLowerCase() === keyLower);
  }

  /**
   * Update camera movement based on currently pressed keys.
   * Called via requestAnimationFrame while keys are pressed.
   */
  private _updateKeyboardMovement(): void {
    if (!this._camera || !this._enabled || this._pressedKeys.size === 0) {
      this._stopKeyboardUpdate();
      return;
    }

    const now = performance.now();
    const deltaTime = Math.min((now - this._lastKeyboardUpdateTime) / 1000, 0.1); // Cap at 100ms to prevent large jumps
    this._lastKeyboardUpdateTime = now;

    // Calculate movement direction
    let moveX = 0;
    let moveY = 0;

    if (this._options.useLastActiveKey) {
      // Use last active key for each direction
      // For X axis: if both left and right are pressed, use the last one
      const leftPressed = this._options.keysLeft.some((k) => this._isKeyPressed(k));
      const rightPressed = this._options.keysRight.some((k) => this._isKeyPressed(k));
      if (leftPressed && rightPressed) {
        // Both pressed - use the last active one based on timestamp
        if (this._lastActiveTimeRight > this._lastActiveTimeLeft) {
          moveX += 1; // Right was pressed last
        } else if (this._lastActiveTimeLeft > this._lastActiveTimeRight) {
          moveX -= 1; // Left was pressed last
        }
      } else {
        // Only one direction pressed, use it normally
        if (leftPressed) moveX -= 1;
        if (rightPressed) moveX += 1;
      }

      // For Y axis: if both up and down are pressed, use the last one
      const upPressed = this._options.keysUp.some((k) => this._isKeyPressed(k));
      const downPressed = this._options.keysDown.some((k) => this._isKeyPressed(k));
      if (upPressed && downPressed) {
        // Both pressed - use the last active one based on timestamp
        if (this._lastActiveTimeDown > this._lastActiveTimeUp) {
          moveY -= 1; // Down was pressed last
        } else if (this._lastActiveTimeUp > this._lastActiveTimeDown) {
          moveY += 1; // Up was pressed last
        }
      } else {
        // Only one direction pressed, use it normally
        if (upPressed) moveY += 1;
        if (downPressed) moveY -= 1;
      }
    } else {
      // Original behavior: conflicting keys cancel out
      if (this._options.keysLeft.some((k) => this._isKeyPressed(k))) {
        moveX -= 1;
      }
      if (this._options.keysRight.some((k) => this._isKeyPressed(k))) {
        moveX += 1;
      }
      if (this._options.keysUp.some((k) => this._isKeyPressed(k))) {
        moveY += 1;
      }
      if (this._options.keysDown.some((k) => this._isKeyPressed(k))) {
        moveY -= 1;
      }
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }

    if (moveX === 0 && moveY === 0) {
      // Safety check: if no movement but keys are still tracked, validate they're actually movement keys
      const hasValidMovementKey =
        this._options.keysUp.some((k) => this._isKeyPressed(k)) ||
        this._options.keysDown.some((k) => this._isKeyPressed(k)) ||
        this._options.keysLeft.some((k) => this._isKeyPressed(k)) ||
        this._options.keysRight.some((k) => this._isKeyPressed(k));
      if (!hasValidMovementKey) {
        // No valid movement keys pressed - clear all and stop
        this._pressedKeys.clear();
        this._stopKeyboardUpdate();
        return;
      }
      // Keys are pressed but movement canceled out - this is normal, continue loop
      this._stopKeyboardUpdate();
      return;
    }

    // Get modifier keys state from tracked state
    const shiftPressed = this._shiftPressed;
    const ctrlPressed = this._ctrlPressed;

    // Calculate speed multiplier
    let speedMultiplier = 1.0;
    if (shiftPressed) {
      speedMultiplier = this._options.shiftMultiplier;
    } else if (ctrlPressed) {
      speedMultiplier = this._options.ctrlMultiplier;
    }

    // Calculate movement delta
    // keyboardMoveSpeed is in world units per second
    // Scale by deltaTime for frame-rate independent movement
    const baseSpeed = this._options.keyboardMoveSpeed;
    const speed = baseSpeed * speedMultiplier;
    const worldDeltaX = moveX * speed * deltaTime;
    const worldDeltaY = moveY * speed * deltaTime;

    // Apply axis inversion
    // For keyboard, X axis is inverted by default (opposite of invertXAxis option)
    // This makes right arrow move camera right (content left), which is more intuitive for keyboard
    const xSign = this._options.invertXAxis ? -1 : 1;
    const ySign = this._options.invertYAxis ? -1 : 1;

    // Move camera
    this._camera.move(xSign * worldDeltaX, ySign * worldDeltaY, 0);

    // Continue update loop
    this._keyboardUpdateRafId = requestAnimationFrame(this._boundKeyboardUpdate);
  }

  /**
   * Log detailed viewport and transformation state for debugging.
   */
  private _logViewportState(context: string): void {
    if (!this._camera) return;

    const canvas = this._camera.arcanvas?.canvas;
    if (!canvas) return;

    const proj = this._camera.projection;
    const view = this._camera.view;

    // Canvas/viewport info
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const aspect = canvasWidth / canvasHeight;

    // Projection bounds (world space bounds visible in viewport)
    const projLeft = proj.left ?? 0;
    const projRight = proj.right ?? 0;
    const projTop = proj.top ?? 0;
    const projBottom = proj.bottom ?? 0;
    const projWidth = projRight - projLeft;
    const projHeight = projTop - projBottom;

    // Camera position (from view matrix eye position)
    // ViewMatrix has an eye property that represents camera position
    const eye = view.eye;
    const cameraPosX = eye.x;
    const cameraPosY = eye.y;
    const cameraPosZ = eye.z;

    // Rectangle bounds in world space (from playground: -100 to 100 on X, -75 to 75 on Y)
    const rectWorldBounds = {
      left: -100,
      right: 100,
      bottom: -75,
      top: 75,
      width: 200,
      height: 150,
      centerX: 0,
      centerY: 0,
    };

    // Calculate if rectangle is visible in viewport
    const rectVisible = rectWorldBounds.right >= projLeft && rectWorldBounds.left <= projRight && rectWorldBounds.top >= projBottom && rectWorldBounds.bottom <= projTop;

    // Calculate rectangle coverage of viewport
    const visibleRectLeft = Math.max(rectWorldBounds.left, projLeft);
    const visibleRectRight = Math.min(rectWorldBounds.right, projRight);
    const visibleRectBottom = Math.max(rectWorldBounds.bottom, projBottom);
    const visibleRectTop = Math.min(rectWorldBounds.top, projTop);
    const visibleRectWidth = Math.max(0, visibleRectRight - visibleRectLeft);
    const visibleRectHeight = Math.max(0, visibleRectTop - visibleRectBottom);
    const visibleRectArea = visibleRectWidth * visibleRectHeight;
    const rectArea = rectWorldBounds.width * rectWorldBounds.height;
    const coveragePercent = rectArea > 0 ? (visibleRectArea / rectArea) * 100 : 0;

    // Calculate rectangle position relative to viewport center
    const viewportCenterX = (projLeft + projRight) / 2;
    const viewportCenterY = (projBottom + projTop) / 2;
    const rectCenterX = (rectWorldBounds.left + rectWorldBounds.right) / 2;
    const rectCenterY = (rectWorldBounds.bottom + rectWorldBounds.top) / 2;
    const rectOffsetFromViewport = {
      x: rectCenterX - viewportCenterX,
      y: rectCenterY - viewportCenterY,
    };

    // Calculate screen space coordinates (NDC to screen)
    // NDC: -1 to 1 maps to screen: 0 to canvasWidth/Height
    const rectScreenLeft = ((rectWorldBounds.left - projLeft) / projWidth) * canvasWidth;
    const rectScreenRight = ((rectWorldBounds.right - projLeft) / projWidth) * canvasWidth;
    const rectScreenBottom = ((rectWorldBounds.bottom - projBottom) / projHeight) * canvasHeight;
    const rectScreenTop = ((rectWorldBounds.top - projBottom) / projHeight) * canvasHeight;

    console.log(`[Camera2DController] Viewport State (${context})`, {
      canvas: {
        width: canvasWidth,
        height: canvasHeight,
        aspect,
        devicePixelRatio: window.devicePixelRatio || 1,
      },
      projection: {
        mode: proj.mode,
        left: projLeft,
        right: projRight,
        top: projTop,
        bottom: projBottom,
        width: projWidth,
        height: projHeight,
        near: proj.near,
        far: proj.far,
      },
      camera: {
        position: { x: cameraPosX, y: cameraPosY, z: cameraPosZ },
        zoom: this._currentZoom,
        viewMatrix: Array.from(view.data).map((v) => Number(Number(v).toFixed(4))),
      },
      rectangle: {
        worldBounds: rectWorldBounds,
        visible: rectVisible,
        visibleBounds: {
          left: visibleRectLeft,
          right: visibleRectRight,
          bottom: visibleRectBottom,
          top: visibleRectTop,
          width: visibleRectWidth,
          height: visibleRectHeight,
        },
        coveragePercent: Number(coveragePercent.toFixed(2)),
        offsetFromViewport: rectOffsetFromViewport,
        screenBounds: {
          left: Number(rectScreenLeft.toFixed(2)),
          right: Number(rectScreenRight.toFixed(2)),
          bottom: Number(rectScreenBottom.toFixed(2)),
          top: Number(rectScreenTop.toFixed(2)),
          width: Number((rectScreenRight - rectScreenLeft).toFixed(2)),
          height: Number((rectScreenTop - rectScreenBottom).toFixed(2)),
        },
      },
      viewport: {
        center: { x: viewportCenterX, y: viewportCenterY },
        worldToScreenScale: {
          x: canvasWidth / projWidth,
          y: canvasHeight / projHeight,
        },
        screenToWorldScale: {
          x: projWidth / canvasWidth,
          y: projHeight / canvasHeight,
        },
      },
    });
  }
}
