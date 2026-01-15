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
}

const DEFAULT_OPTIONS: Required<Camera2DControllerOptions> = {
  minZoom: 0.001,
  maxZoom: 10,
  zoomSensitivity: 0.01,
  panSensitivity: 1.0,
  invertYAxis: false,
  invertXAxis: false,
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

  // Bound event handlers to allow removal
  private _boundMouseDown: (e: MouseEvent) => void;
  private _boundMouseMove: (e: MouseEvent) => void;
  private _boundMouseUp: (e: MouseEvent) => void;
  private _boundWheel: (e: WheelEvent) => void;

  constructor(options: Camera2DControllerOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
    this._boundMouseDown = this.handleMouseDown.bind(this);
    this._boundMouseMove = this.handleMouseMove.bind(this);
    this._boundMouseUp = this.handleMouseUp.bind(this);
    this._boundWheel = this.handleWheel.bind(this);
  }

  attach(camera: Camera): void {
    this.detach();

    this._camera = camera;
    console.log("[Camera2DController] Attached to camera");

    // Ensure camera uses orthographic projection for 2D
    const canvas = camera.arcanvas?.canvas;
    if (canvas) {
      const aspect = canvas.width / canvas.height;
      // Set initial zoom higher than minZoom to allow zooming out
      // Initial zoom 0.1 = size 10, which shows objects up to 20 units wide/tall
      // This allows zooming out to minZoom (0.001 = size 1000)
      this._currentZoom = 0.1;

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
    } else {
      this._currentZoom = 0.1;
      camera.projection.update({
        mode: ProjectionMode.Orthographic,
        left: -100,
        right: 100,
        top: 100,
        bottom: -100,
        near: -1000,
        far: 1000,
      } as unknown as Parameters<typeof camera.projection.update>[0]);
    }

    if (this._enabled) {
      this._attachEventListeners();
    }

    // Log viewport state after attachment and projection setup
    this._logViewportState("attach");
  }

  detach(): void {
    this._removeEventListeners();
    if (this._camera) {
      console.log("[Camera2DController] Detached from camera");
    }
    this._camera = null;
    this._isPanning = false;
  }

  handleMouseDown(event: MouseEvent): void {
    if (!this._camera || !this._enabled) return;

    this._isPanning = true;
    this._lastMouseX = event.clientX;
    this._lastMouseY = event.clientY;
    console.log("[Camera2DController] Pan started", { x: event.clientX, y: event.clientY });
    event.preventDefault();
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this._camera || !this._enabled || !this._isPanning) return;

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
    event.preventDefault();
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
    const canvas = this._camera.arcanvas?.canvas;
    if (!canvas) return;

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

    this._camera.projection.update({
      mode: ProjectionMode.Orthographic,
      left: -halfHeight * aspect,
      right: halfHeight * aspect,
      top: halfHeight,
      bottom: -halfHeight,
      near: -1000,
      far: 1000,
    } as unknown as Parameters<typeof this._camera.projection.update>[0]);

    event.preventDefault();
  }

  enable(): void {
    if (this._enabled) return;

    this._enabled = true;
    console.log("[Camera2DController] Enabled");
    if (this._camera) {
      this._attachEventListeners();
    }
  }

  disable(): void {
    if (!this._enabled) return;

    this._enabled = false;
    console.log("[Camera2DController] Disabled");
    this._removeEventListeners();
    this._isPanning = false;
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

    const canvas = this._camera.arcanvas?.canvas;
    if (!canvas) return;

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

  private _attachEventListeners(): void {
    const canvas = this._camera?.arcanvas?.canvas;
    if (!canvas) return;

    canvas.addEventListener("mousedown", this._boundMouseDown);
    canvas.addEventListener("mousemove", this._boundMouseMove);
    canvas.addEventListener("mouseup", this._boundMouseUp);
    // Use { passive: false } to allow preventDefault() for zoom
    // This is important for touchpad gestures
    canvas.addEventListener("wheel", this._boundWheel, { passive: false });
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
    canvas.removeEventListener("mousemove", this._boundMouseMove);
    canvas.removeEventListener("mouseup", this._boundMouseUp);
    canvas.removeEventListener("wheel", this._boundWheel);
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
