// camera/Camera2D.ts
import type { Arcanvas } from "../Arcanvas";
import { ProjectionMode } from "../utils/ProjectionEnum";
import { ProjectionMatrix } from "../utils/ProjectionMatrix";
import { TransformationMatrix } from "../utils/TransformationMatrix";
import { Camera } from "./Camera";

/**
 *
 */
export interface Camera2DOptions {
  moveSpeed?: number; // pixels per second
  rotationSpeed?: number; // radians per second
  enableControls?: boolean;
  movementSpace?: "camera" | "world";
  clipZ01?: boolean; // true for [0,1], false for [-1,1]
  zoom?: number; // scale factor (1 = 1 world px == 1 unit)
}

/**
 *
 */
export class Camera2D extends Camera {
  private _x = 0;
  private _y = 0;
  private _rotation = 0;
  private _moveSpeed: number;
  private _rotationSpeed: number;
  private _enableControls: boolean;
  private _movementSpace: "camera" | "world";
  private _keys: Set<string> = new Set();
  private _keyHandlers: Array<() => void> = [];
  private _lastUpdateTime = 0;
  private _updateLoop: number | null = null;
  private _isDragging = false;
  private _lastMouseX = 0;
  private _lastMouseY = 0;
  private _mouseHandlers: Array<() => void> = [];
  private _touchHandlers: Array<() => void> = [];
  private _clipZ01: boolean;
  private _zoom: number;
  private _initialPinchDistance: number | null = null;
  private _initialZoom: number | null = null;
  private _zoomSpeed: number = 0.001; // Sensibility for wheel zoom

  constructor(app: Arcanvas, options: Camera2DOptions = {}) {
    super(app);
    this._moveSpeed = options.moveSpeed ?? 100;
    this._rotationSpeed = options.rotationSpeed ?? 1;
    this._enableControls = options.enableControls ?? true;
    this._movementSpace = options.movementSpace ?? "camera";
    this._clipZ01 = options.clipZ01 ?? false; // default OpenGL
    this._zoom = Math.max(1e-6, options.zoom ?? 1);
    this.updateProjection();
  }

  get x() {
    return this._x;
  }
  set x(v: number) {
    if (this._x !== v) {
      this._x = v;
      this._isProjectionDirty = true;
      this.emit("move", this._x, this._y);
    }
  }

  get y() {
    return this._y;
  }
  set y(v: number) {
    if (this._y !== v) {
      this._y = v;
      this._isProjectionDirty = true;
      this.emit("move", this._x, this._y);
    }
  }

  get rotation() {
    return this._rotation;
  }
  set rotation(v: number) {
    if (this._rotation !== v) {
      this._rotation = v;
      this._isProjectionDirty = true;
      this.emit("rotate", this._rotation);
    }
  }

  get zoom() {
    return this._zoom;
  }
  set zoom(v: number) {
    const z = Math.max(1e-6, v);
    if (this._zoom !== z) {
      this._zoom = z;
      this._isProjectionDirty = true;
      this.emit("zoom", this._zoom);
    }
  }

  move(dx: number, dy: number) {
    this.x += dx;
    this.y -= dy;
  }
  rotate(delta: number) {
    this.rotation += delta;
  }

  /**
   * Zoom towards a specific screen point (in canvas coordinates).
   * Keeps the world point under the screen point fixed.
   */
  zoomTowards(screenX: number, screenY: number, zoomDelta: number): void {
    const canvas = this.app.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Calculate the world point under the cursor before zoom change
    // Transform: screen -> local -> rotated -> world
    const localX = screenX - centerX;
    const localY = screenY - centerY;

    // Convert local screen delta to world space (account for rotation)
    const cosP = Math.cos(this._rotation);
    const sinP = Math.sin(this._rotation);
    const cosM = Math.cos(-this._rotation);
    const sinM = Math.sin(-this._rotation);

    const worldX = (localX * cosP - localY * sinP) / this._zoom + this._x;
    const worldY = (localX * sinP + localY * cosP) / this._zoom + this._y;

    // Apply zoom change
    const newZoom = Math.max(1e-6, this._zoom * (1 + zoomDelta));

    // Calculate where this world point would appear on screen with new zoom
    // Transform: world -> rotated -> zoomed -> local -> screen
    const newRotatedX = (worldX - this._x) * newZoom;
    const newRotatedY = (worldY - this._y) * newZoom;

    // Apply inverse rotation to get back to local screen space
    const newLocalX = newRotatedX * cosM - newRotatedY * sinM;
    const newLocalY = newRotatedX * sinM + newRotatedY * cosM;

    const newScreenX = newLocalX + centerX;
    const newScreenY = newLocalY + centerY;

    // Adjust camera position so the world point maps back to original screen position
    const screenDeltaX = screenX - newScreenX;
    const screenDeltaY = screenY - newScreenY;

    // Convert screen delta to world delta (account for rotation)
    const localDeltaX = screenDeltaX / newZoom;
    const localDeltaY = screenDeltaY / newZoom;
    const worldDeltaX = localDeltaX * cosP - localDeltaY * sinP;
    const worldDeltaY = localDeltaX * sinP + localDeltaY * cosP;

    this._zoom = newZoom;
    this.x += worldDeltaX;
    this.y += worldDeltaY;
    this._isProjectionDirty = true;
    this.emit("zoom", this._zoom);
  }

  protected updateProjection(): void {
    const width = this.app.canvas.width;
    const height = this.app.canvas.height;

    // Pixel-space ortho covering [0, width] x [0, height]
    // Y-down on screen: bottom=height, top=0 to flip
    const proj = new ProjectionMatrix(undefined, ProjectionMode.Orthographic, undefined, width / height, 0.1, 1000, this._clipZ01);

    // View matrix: center the camera at (x, y), rotate about that center, apply zoom
    // We'll build: V = T_center * R * S * T(-x, -y, 0)
    // const view = TransformationMatrix.identity()
    //   .postMultiply(TransformationMatrix.makeTranslation(width * 0.5, height * 0.5, 0))
    //   .postMultiply(TransformationMatrix.makeRotationZ(-this._rotation))
    //   .postMultiply(TransformationMatrix.makeScale(this._zoom, this._zoom, 1))
    //   .postMultiply(TransformationMatrix.makeTranslation(this._x, this._y, 0));
    const view = TransformationMatrix.identity()
      .translate(width * 0.5, height * 0.5, 0)
      .rotateZ(-this._rotation)
      .scale(this._zoom, this._zoom, 1)
      .translate(this._x, this._y, 0);

    this._projection = ProjectionMatrix.fromArray(proj.mult(view).toArray());
  }

  protected override onActivate(): void {
    if (!this._enableControls) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.app.isFocused()) {
        this._keys.add(e.key.toLowerCase());
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (this.app.isFocused()) {
        this._keys.delete(e.key.toLowerCase());
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    this._keyHandlers.push(
      () => window.removeEventListener("keydown", handleKeyDown),
      () => window.removeEventListener("keyup", handleKeyUp)
    );

    const canvas = this.app.canvas;
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        this._isDragging = true;
        // Store client coordinates for tracking
        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
        canvas.style.cursor = "grabbing";
        e.preventDefault();
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (this._isDragging) {
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const lastX = this._lastMouseX - rect.left;
        const lastY = this._lastMouseY - rect.top;

        // Scale to canvas device coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasDx = (currentX - lastX) * scaleX;
        const canvasDy = (currentY - lastY) * scaleY;

        // Convert canvas pixel delta to world delta
        // The plane should move with the cursor, so we convert screen movement to world movement
        const worldDx = canvasDx / this._zoom;
        const worldDy = -canvasDy / this._zoom;

        if (this._movementSpace === "camera") {
          const cos = Math.cos(this._rotation);
          const sin = Math.sin(this._rotation);
          const rx = worldDx * cos - worldDy * sin;
          const ry = worldDx * sin + worldDy * cos;
          this.move(rx, ry);
        } else {
          this.move(worldDx, worldDy);
        }

        this._lastMouseX = e.clientX;
        this._lastMouseY = e.clientY;
        e.preventDefault();
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        this._isDragging = false;
        canvas.style.cursor = "";
        e.preventDefault();
      }
    };
    const handleMouseLeave = () => {
      this._isDragging = false;
      canvas.style.cursor = "";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    this._mouseHandlers.push(
      () => canvas.removeEventListener("mousedown", handleMouseDown),
      () => window.removeEventListener("mousemove", handleMouseMove),
      () => window.removeEventListener("mouseup", handleMouseUp),
      () => canvas.removeEventListener("mouseleave", handleMouseLeave)
    );

    // Wheel zoom
    const handleWheel = (e: WheelEvent) => {
      // Prevent default scrolling
      e.preventDefault();

      // Get mouse position relative to canvas
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Scale to canvas device coordinates
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;

      // Calculate zoom delta
      // Handle different delta modes (pixel, line, page)
      let delta = 0;
      if (e.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
        // Pixel mode (most trackpads)
        delta = -e.deltaY * this._zoomSpeed;
      } else if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        // Line mode (mouse wheel)
        delta = -e.deltaY * this._zoomSpeed * 16; // Approximate line height
      } else {
        // Page mode
        delta = -e.deltaY * this._zoomSpeed * 100;
      }

      // On macOS, Cmd/Ctrl + scroll is often used for zoom, but we'll use regular scroll
      // For pinch-to-zoom on trackpad, we'll handle that via touch events
      this.zoomTowards(canvasX, canvasY, delta);
    };

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    this._mouseHandlers.push(() => canvas.removeEventListener("wheel", handleWheel));

    // Touch pinch zoom
    let touches: Touch[] = [];
    const handleTouchStart = (e: TouchEvent) => {
      touches = Array.from(e.touches);
      if (touches.length === 2) {
        // Start pinch gesture
        const touch1 = touches[0]!;
        const touch2 = touches[1]!;
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        this._initialPinchDistance = Math.hypot(dx, dy);
        this._initialZoom = this._zoom;
        e.preventDefault();
      } else if (touches.length === 1) {
        // Single touch - treat as pan (drag)
        const touch = touches[0]!;
        this._isDragging = true;
        const rect = canvas.getBoundingClientRect();
        this._lastMouseX = touch.clientX - rect.left;
        this._lastMouseY = touch.clientY - rect.top;
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      touches = Array.from(e.touches);
      if (touches.length === 2 && this._initialPinchDistance !== null && this._initialZoom !== null) {
        // Pinch zoom
        const touch1 = touches[0]!;
        const touch2 = touches[1]!;
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        const currentDistance = Math.hypot(dx, dy);

        const scale = currentDistance / this._initialPinchDistance;
        const newZoom = Math.max(1e-6, this._initialZoom * scale);

        // Calculate center point of pinch
        const rect = canvas.getBoundingClientRect();
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

        // Scale to canvas device coordinates
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = centerX * scaleX;
        const canvasY = centerY * scaleY;

        // Zoom towards center point
        const zoomDelta = newZoom / this._zoom - 1;
        this.zoomTowards(canvasX, canvasY, zoomDelta);

        e.preventDefault();
      } else if (touches.length === 1 && this._isDragging) {
        // Single touch pan
        const touch = touches[0]!;
        const rect = canvas.getBoundingClientRect();
        const currentX = touch.clientX - rect.left;
        const currentY = touch.clientY - rect.top;

        const dx = currentX - this._lastMouseX;
        const dy = currentY - this._lastMouseY;
        this._lastMouseX = currentX;
        this._lastMouseY = currentY;

        const worldDx = dx / this._zoom;
        const worldDy = -dy / this._zoom;

        if (this._movementSpace === "camera") {
          const cos = Math.cos(this._rotation);
          const sin = Math.sin(this._rotation);
          const rx = worldDx * cos - worldDy * sin;
          const ry = worldDx * sin + worldDy * cos;
          this.move(rx, ry);
        } else {
          this.move(worldDx, worldDy);
        }

        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touches = Array.from(e.touches);
      if (touches.length < 2) {
        this._initialPinchDistance = null;
        this._initialZoom = null;
      }
      if (touches.length === 0) {
        this._isDragging = false;
      }
      e.preventDefault();
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    this._touchHandlers.push(
      () => canvas.removeEventListener("touchstart", handleTouchStart),
      () => canvas.removeEventListener("touchmove", handleTouchMove),
      () => canvas.removeEventListener("touchend", handleTouchEnd),
      () => canvas.removeEventListener("touchcancel", handleTouchEnd)
    );

    this._lastUpdateTime = performance.now();
    const update = (now: number) => {
      if (!this.active) return;
      const dt = (now - this._lastUpdateTime) / 1000;
      this._lastUpdateTime = now;

      let dx = 0;
      let dy = 0;
      if (this._keys.has("w") || this._keys.has("arrowup")) dy += this._moveSpeed * dt;
      if (this._keys.has("s") || this._keys.has("arrowdown")) dy -= this._moveSpeed * dt;
      if (this._keys.has("a") || this._keys.has("arrowleft")) dx -= this._moveSpeed * dt;
      if (this._keys.has("d") || this._keys.has("arrowright")) dx += this._moveSpeed * dt;

      if (dx !== 0 || dy !== 0) {
        if (this._movementSpace === "camera") {
          const cos = Math.cos(this._rotation);
          const sin = Math.sin(this._rotation);
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          this.move(rx, ry);
        } else {
          this.move(dx, dy);
        }
      }

      if (this._keys.has("q")) this.rotate(-this._rotationSpeed * dt);
      if (this._keys.has("e")) this.rotate(this._rotationSpeed * dt);

      this._isProjectionDirty = true; // ensure matrix updates
      this._updateLoop = requestAnimationFrame(update);
    };
    this._updateLoop = requestAnimationFrame(update);
  }

  protected override onDeactivate(): void {
    this._keyHandlers.forEach((c) => c());
    this._keyHandlers = [];
    this._keys.clear();

    this._mouseHandlers.forEach((c) => c());
    this._mouseHandlers = [];

    this._touchHandlers.forEach((c) => c());
    this._touchHandlers = [];

    this._isDragging = false;
    this._initialPinchDistance = null;
    this._initialZoom = null;
    this.app.canvas.style.cursor = "";

    if (this._updateLoop !== null) {
      cancelAnimationFrame(this._updateLoop);
      this._updateLoop = null;
    }
  }
}
