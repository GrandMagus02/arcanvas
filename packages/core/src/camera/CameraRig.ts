import type { EventMap } from "../infrastructure/events/EventMap";
import { EventKey } from "../utils";
import { Subscribable } from "../utils/Subscribable";
import type { Camera } from "./Camera";
import type { CameraInputState, ICameraController } from "./ICameraController";

/**
 * Events emitted by CameraRig.
 */
export interface CameraRigEvents extends EventMap {
  /** Emitted when a controller is added */
  controllerAdded: [controller: ICameraController];
  /** Emitted when a controller is removed */
  controllerRemoved: [controller: ICameraController];
  /** Emitted when the rig is enabled */
  enabled: [];
  /** Emitted when the rig is disabled */
  disabled: [];
  /** Emitted after each update cycle */
  update: [dt: number];
}

/**
 * Options for configuring a CameraRig.
 */
export interface CameraRigOptions {
  /**
   * Initial list of controllers to add.
   */
  controllers?: ICameraController[];

  /**
   * Whether to start enabled (default: true).
   */
  enabled?: boolean;

  /**
   * The canvas element to attach input listeners to.
   * If not provided, will use camera.arcanvas.canvas if available.
   */
  canvas?: HTMLCanvasElement;

  /**
   * Whether to capture mouse events on document during drag operations (default: true).
   */
  captureMouseOnDocument?: boolean;
}

/**
 * CameraRig is a composite that owns a Camera reference and a list of ICameraController instances.
 * It manages input state collection and distributes updates to controllers in priority order.
 *
 * @example
 * ```typescript
 * const camera = new Camera(arcanvas);
 * const rig = new CameraRig(camera, {
 *   controllers: [
 *     new CameraZoomController({ minZoom: 0.1, maxZoom: 10 }),
 *     new CameraPanController({ panMouseButton: 0, panModifierKeys: "Space" }),
 *     new CameraKeyboardController({ keyboardMoveSpeed: 100 }),
 *   ]
 * });
 * rig.enable();
 * ```
 */
export class CameraRig extends Subscribable<CameraRigEvents> {
  private _camera: Camera;
  private _controllers: ICameraController[] = [];
  private _enabled: boolean = false;
  private _canvas: HTMLCanvasElement | null = null;
  private _captureMouseOnDocument: boolean;

  // Input state
  private _inputState: CameraInputState;
  private _keysDown: Set<string> = new Set();
  private _pointers: Map<
    number,
    {
      position: { x: number; y: number };
      buttons: number[];
      type: "mouse" | "touch" | "pen";
    }
  > = new Map();
  private _wheelDelta: { x: number; y: number; z: number; deltaMode: number } | null = null;
  private _modifiers = { shift: false, ctrl: false, alt: false, meta: false };

  // Animation frame state
  private _rafId: number | null = null;
  private _lastUpdateTime: number = 0;

  // Document mouse capture state
  private _documentMouseListenersAttached: boolean = false;
  private _isPointerDown: boolean = false;

  // Bound event handlers
  private _boundMouseDown: (e: MouseEvent) => void;
  private _boundMouseMove: (e: MouseEvent) => void;
  private _boundMouseUp: (e: MouseEvent) => void;
  private _boundWheel: (e: WheelEvent) => void;
  private _boundKeyDown: (e: KeyboardEvent) => void;
  private _boundKeyUp: (e: KeyboardEvent) => void;
  private _boundBlur: () => void;
  private _boundResize: (width: number, height: number) => void;
  private _boundUpdate: () => void;

  constructor(camera: Camera, options: CameraRigOptions = {}) {
    super();
    this._camera = camera;
    this._captureMouseOnDocument = options.captureMouseOnDocument ?? true;

    // Initialize input state
    this._inputState = {
      keysDown: this._keysDown,
      modifiers: this._modifiers,
      pointers: this._pointers,
      wheelDelta: null,
      viewport: { width: 0, height: 0 },
      deltaTime: 0,
    };

    // Bind event handlers
    this._boundMouseDown = this._handleMouseDown.bind(this);
    this._boundMouseMove = this._handleMouseMove.bind(this);
    this._boundMouseUp = this._handleMouseUp.bind(this);
    this._boundWheel = this._handleWheel.bind(this);
    this._boundKeyDown = this._handleKeyDown.bind(this);
    this._boundKeyUp = this._handleKeyUp.bind(this);
    this._boundBlur = this._handleBlur.bind(this);
    this._boundResize = this._handleResize.bind(this);
    this._boundUpdate = this._update.bind(this);

    // Set canvas
    if (options.canvas) {
      this._canvas = options.canvas;
    } else if (camera.arcanvas?.canvas) {
      this._canvas = camera.arcanvas.canvas;
    }

    // Add initial controllers
    if (options.controllers) {
      for (const controller of options.controllers) {
        this.add(controller);
      }
    }

    // Auto-enable if specified
    if (options.enabled !== false) {
      this.enable();
    }
  }

  /**
   * Get the camera controlled by this rig.
   */
  get camera(): Camera {
    return this._camera;
  }

  /**
   * Get the list of controllers (read-only).
   */
  get controllers(): readonly ICameraController[] {
    return this._controllers;
  }

  /**
   * Check if the rig is currently enabled.
   */
  get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Get the canvas element.
   */
  get canvas(): HTMLCanvasElement | null {
    return this._canvas;
  }

  /**
   * Set the canvas element.
   */
  set canvas(canvas: HTMLCanvasElement | null) {
    const wasEnabled = this._enabled;
    if (wasEnabled) {
      this.disable();
    }
    this._canvas = canvas;
    if (wasEnabled && canvas) {
      this.enable();
    }
  }

  /**
   * Add a controller to the rig.
   * Controllers are sorted by priority (higher priority first).
   * @param controller - The controller to add
   * @returns this for chaining
   */
  add(controller: ICameraController): this {
    // Check for duplicate
    if (this._controllers.some((c) => c.id === controller.id)) {
      console.warn(`[CameraRig] Controller with id "${controller.id}" already exists, skipping.`);
      return this;
    }

    this._controllers.push(controller);
    this._sortControllers();

    // Call onAttach if available
    if (controller.onAttach) {
      controller.onAttach(this);
    }

    this.emit("controllerAdded", controller);
    return this;
  }

  /**
   * Remove a controller from the rig.
   * @param controllerOrId - The controller or controller ID to remove
   * @returns this for chaining
   */
  remove(controllerOrId: ICameraController | string): this {
    const id = typeof controllerOrId === "string" ? controllerOrId : controllerOrId.id;
    const index = this._controllers.findIndex((c) => c.id === id);

    if (index === -1) {
      console.warn(`[CameraRig] Controller with id "${id}" not found.`);
      return this;
    }

    const controller = this._controllers[index]!;
    this._controllers.splice(index, 1);

    // Call onDetach if available
    if (controller.onDetach) {
      controller.onDetach(this);
    }

    this.emit("controllerRemoved", controller);
    return this;
  }

  /**
   * Get a controller by ID with type casting.
   * @param id - The controller ID
   * @returns The controller, or undefined if not found
   */
  get<T extends ICameraController>(id: string): T | undefined {
    return this._controllers.find((c) => c.id === id) as T | undefined;
  }

  /**
   * Enable the rig and start processing input.
   */
  enable(): void {
    if (this._enabled) return;

    this._enabled = true;
    this._attachEventListeners();
    this._startUpdateLoop();

    this.emit("enabled");
  }

  /**
   * Disable the rig and stop processing input.
   */
  disable(): void {
    if (!this._enabled) return;

    this._enabled = false;
    this._stopUpdateLoop();
    this._removeEventListeners();
    this._clearInputState();

    this.emit("disabled");
  }

  /**
   * Destroy the rig, detaching all controllers and removing all listeners.
   */
  destroy(): void {
    this.disable();

    // Detach all controllers
    for (const controller of [...this._controllers]) {
      this.remove(controller);
    }
  }

  /**
   * Sort controllers by priority (higher first).
   */
  private _sortControllers(): void {
    this._controllers.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  }

  /**
   * Attach event listeners to canvas and window.
   */
  private _attachEventListeners(): void {
    if (!this._canvas) return;

    this._canvas.addEventListener("mousedown", this._boundMouseDown);
    this._canvas.addEventListener("mousemove", this._boundMouseMove);
    if (!this._captureMouseOnDocument) {
      this._canvas.addEventListener("mouseup", this._boundMouseUp);
    }
    this._canvas.addEventListener("wheel", this._boundWheel, { passive: false });

    // Keyboard events on window
    window.addEventListener("keydown", this._boundKeyDown);
    window.addEventListener("keyup", this._boundKeyUp);
    window.addEventListener("blur", this._boundBlur);

    // Listen for resize events from arcanvas
    if (this._camera.arcanvas) {
      this._camera.arcanvas.on(EventKey.Resize, this._boundResize);
    }

    // Initialize viewport size
    this._inputState.viewport = {
      width: this._canvas.clientWidth,
      height: this._canvas.clientHeight,
    };
  }

  /**
   * Remove event listeners from canvas and window.
   */
  private _removeEventListeners(): void {
    if (!this._canvas) return;

    this._canvas.removeEventListener("mousedown", this._boundMouseDown);
    this._canvas.removeEventListener("mousemove", this._boundMouseMove);
    if (!this._captureMouseOnDocument) {
      this._canvas.removeEventListener("mouseup", this._boundMouseUp);
    }
    this._canvas.removeEventListener("wheel", this._boundWheel);

    window.removeEventListener("keydown", this._boundKeyDown);
    window.removeEventListener("keyup", this._boundKeyUp);
    window.removeEventListener("blur", this._boundBlur);

    if (this._camera.arcanvas) {
      this._camera.arcanvas.off(EventKey.Resize, this._boundResize);
    }

    // Clean up document listeners if attached
    if (this._documentMouseListenersAttached) {
      this._removeDocumentMouseListeners();
    }
  }

  /**
   * Attach document-level mouse listeners for drag operations.
   */
  private _attachDocumentMouseListeners(): void {
    if (this._documentMouseListenersAttached) return;

    document.addEventListener("mousemove", this._boundMouseMove);
    document.addEventListener("mouseup", this._boundMouseUp);
    this._documentMouseListenersAttached = true;
  }

  /**
   * Remove document-level mouse listeners.
   */
  private _removeDocumentMouseListeners(): void {
    if (!this._documentMouseListenersAttached) return;

    document.removeEventListener("mousemove", this._boundMouseMove);
    document.removeEventListener("mouseup", this._boundMouseUp);
    this._documentMouseListenersAttached = false;
  }

  /**
   * Clear all input state.
   */
  private _clearInputState(): void {
    this._keysDown.clear();
    this._pointers.clear();
    this._wheelDelta = null;
    this._modifiers = { shift: false, ctrl: false, alt: false, meta: false };
    this._inputState.modifiers = this._modifiers;
    this._isPointerDown = false;
  }

  /**
   * Start the update loop.
   */
  private _startUpdateLoop(): void {
    if (this._rafId !== null) return;

    this._lastUpdateTime = performance.now();
    this._rafId = requestAnimationFrame(this._boundUpdate);
  }

  /**
   * Stop the update loop.
   */
  private _stopUpdateLoop(): void {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /**
   * Main update loop - called each frame.
   */
  private _update(): void {
    if (!this._enabled) return;

    const now = performance.now();
    const dt = Math.min((now - this._lastUpdateTime) / 1000, 0.1); // Cap at 100ms
    this._lastUpdateTime = now;

    // Update input state
    this._inputState.deltaTime = dt;
    this._inputState.wheelDelta = this._wheelDelta;

    // Process controllers in priority order
    for (const controller of this._controllers) {
      if (!controller.enabled) continue;

      const consumed = controller.update(dt, this._camera, this._inputState);
      if (consumed) {
        // Controller consumed input, stop processing
        break;
      }
    }

    // Clear wheel delta after processing
    this._wheelDelta = null;

    this.emit("update", dt);

    // Schedule next frame
    this._rafId = requestAnimationFrame(this._boundUpdate);
  }

  // --- Event Handlers ---

  private _handleMouseDown(event: MouseEvent): void {
    if (!this._enabled) return;

    const buttons: number[] = [];
    if (event.buttons & 1) buttons.push(0); // Left
    if (event.buttons & 2) buttons.push(2); // Right
    if (event.buttons & 4) buttons.push(1); // Middle

    this._pointers.set(0, {
      position: { x: event.clientX, y: event.clientY },
      buttons,
      type: "mouse",
    });

    this._updateModifiers(event);
    this._isPointerDown = true;

    // Attach document listeners if capture is enabled
    if (this._captureMouseOnDocument) {
      this._attachDocumentMouseListeners();
    }
  }

  private _handleMouseMove(event: MouseEvent): void {
    if (!this._enabled) return;

    const existing = this._pointers.get(0);
    const buttons: number[] = [];
    if (event.buttons & 1) buttons.push(0);
    if (event.buttons & 2) buttons.push(2);
    if (event.buttons & 4) buttons.push(1);

    this._pointers.set(0, {
      position: { x: event.clientX, y: event.clientY },
      buttons,
      type: existing?.type ?? "mouse",
    });

    this._updateModifiers(event);
  }

  private _handleMouseUp(event: MouseEvent): void {
    if (!this._enabled) return;

    const buttons: number[] = [];
    if (event.buttons & 1) buttons.push(0);
    if (event.buttons & 2) buttons.push(2);
    if (event.buttons & 4) buttons.push(1);

    if (buttons.length === 0) {
      this._pointers.delete(0);
      this._isPointerDown = false;
    } else {
      const existing = this._pointers.get(0);
      this._pointers.set(0, {
        position: { x: event.clientX, y: event.clientY },
        buttons,
        type: existing?.type ?? "mouse",
      });
    }

    this._updateModifiers(event);

    // Remove document listeners
    if (this._documentMouseListenersAttached && !this._isPointerDown) {
      this._removeDocumentMouseListeners();
    }
  }

  private _handleWheel(event: WheelEvent): void {
    if (!this._enabled) return;

    this._wheelDelta = {
      x: event.deltaX,
      y: event.deltaY,
      z: event.deltaZ,
      deltaMode: event.deltaMode,
    };

    this._updateModifiers(event);

    // Prevent default to allow zoom handling
    event.preventDefault();
  }

  private _handleKeyDown(event: KeyboardEvent): void {
    if (!this._enabled) return;

    this._keysDown.add(event.key);
    this._updateModifiers(event);
  }

  private _handleKeyUp(event: KeyboardEvent): void {
    if (!this._enabled) return;

    // Handle case-insensitive key removal
    const keyLower = event.key.toLowerCase();
    for (const key of this._keysDown) {
      if (key.toLowerCase() === keyLower) {
        this._keysDown.delete(key);
        break;
      }
    }

    this._updateModifiers(event);
  }

  private _handleBlur(): void {
    this._clearInputState();
  }

  private _handleResize(width: number, height: number): void {
    this._inputState.viewport = { width, height };
  }

  private _updateModifiers(event: MouseEvent | WheelEvent | KeyboardEvent): void {
    this._modifiers.shift = event.shiftKey;
    this._modifiers.ctrl = event.ctrlKey;
    this._modifiers.alt = event.altKey;
    this._modifiers.meta = event.metaKey;
  }
}
