import { Camera } from "./camera/Camera";
import { Camera2D } from "./camera/Camera2D";
import { EventBus } from "./EventBus";
import { GridMesh } from "./meshes/grid/Grid";
import { Mesh } from "./objects/Mesh";
import { type PluginLike } from "./Plugin";
import { PluginManager } from "./PluginManager";
import { Renderer } from "./Renderer";
import { Stage } from "./Stage";
import type { TransformationMatrix } from "./utils/TransformationMatrix";

/**
 * Options for configuring an `Arcanvas` instance.
 */
export interface ArcanvasOptions {
  width: number;
  height: number;
  focusable: boolean;
  [key: string]: unknown;
}

/**
 * Default `Arcanvas` options.
 */
const _DEFAULT_ARCANVAS_OPTIONS: ArcanvasOptions = Object.freeze({
  width: 100,
  height: 100,
  focusable: true,
});

/**
 * Arcanvas is a class that provides a canvas for rendering.
 */
export class Arcanvas {
  private _canvas: HTMLCanvasElement;

  private _options: ArcanvasOptions = Object.assign({}, _DEFAULT_ARCANVAS_OPTIONS);

  private _events: EventBus;
  private _renderer: Renderer;
  private _plugin: PluginManager;
  private _stage: Stage;
  private _currentCamera: Camera | null = null;

  private _isFocused: boolean = false;

  constructor(canvas: HTMLCanvasElement, options: Partial<ArcanvasOptions> = {}) {
    this._canvas = canvas;
    this.updateOptions(options);
    this.applyOptions();

    this._events = new EventBus();
    this._plugin = new PluginManager(this);
    this._stage = new Stage(this);
    this._renderer = new Renderer(canvas);

    // Create and set default camera
    const defaultCamera = new Camera2D(this);
    this._currentCamera = defaultCamera;
    defaultCamera.activate();

    // Device pixel ratio aware initial sizing if width/height not explicitly set
    this.applyDprSizing();

    this._renderer.onDraw((gl) => {
      this._stage.traverse((node) => {
        if (node instanceof Mesh) {
          // Use current camera's projection matrix (camera is always set)
          const projMatrix = this._currentCamera!.getProjection();

          // Special handling for GridMesh
          if (node instanceof GridMesh) {
            node.setViewProjection(projMatrix);
            node.setViewportSize(this._canvas.width, this._canvas.height);
            // Get camera position if available
            const camera = this._currentCamera!;
            if ("x" in camera && "y" in camera) {
              const x = (camera as { x: number }).x;
              const y = (camera as { y: number }).y;
              const z = "z" in camera ? (camera as { z: number }).z : 0;
              node.setCameraPosition(x, y, z);
            }
          } else {
            // Set projection matrix on mesh if it supports it
            if ("setProjectionMatrix" in node && typeof node.setProjectionMatrix === "function") {
              (node as { setProjectionMatrix: (m: TransformationMatrix) => void }).setProjectionMatrix(projMatrix);
            }
          }

          node.render(gl);
        }
      });
    });
  }

  get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  set canvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  get options(): ArcanvasOptions {
    return this._options;
  }

  set options(options: ArcanvasOptions) {
    this._options = options;
  }

  get stage(): Stage {
    return this._stage;
  }

  /**
   * Get the current active camera.
   */
  get camera(): Camera | null {
    return this._currentCamera;
  }

  /**
   * Set the current active camera. Deactivates the previous camera and activates the new one.
   * If null is passed, a default Camera2D will be created and activated.
   */
  setCamera(camera: Camera | null): void {
    if (this._currentCamera === camera) return;

    // Deactivate previous camera
    if (this._currentCamera) {
      this._currentCamera.deactivate();
    }

    // Activate new camera (or create default if null)
    if (camera === null) {
      camera = new Camera2D(this);
    }
    this._currentCamera = camera;
    this._currentCamera.activate();
  }

  /**
   * Subscribe to an event.
   * @param event - The event name to subscribe to.
   * @param fn - The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  on(event: string, fn: (...args: unknown[]) => void): () => void {
    return this._events.on(event, fn);
  }

  /**
   * Subscribe to an event once.
   * @param event - The event name to subscribe to.
   * @param fn - The callback function to call when the event is emitted.
   * @returns A function to unsubscribe from the event.
   */
  once(event: string, fn: (...args: unknown[]) => void): () => void {
    return this._events.once(event, fn);
  }

  /**
   * Unsubscribe from an event.
   * @param event - The event name to unsubscribe from.
   * @param fn - The callback function to remove.
   */
  off(event: string, fn: (...args: unknown[]) => void): void {
    this._events.off(event, fn);
  }

  /**
   * Emit an event.
   * @param event - The event name to emit.
   * @param args - Arguments to pass to event handlers.
   */
  emit(event: string, ...args: unknown[]): void {
    this._events.emit(event, ...args);
  }

  getOptions(): ArcanvasOptions {
    return this.options;
  }

  updateOptions(options: Partial<ArcanvasOptions>) {
    const oldWidth = this._canvas.width;
    const oldHeight = this._canvas.height;
    Object.assign(this.options, options);
    this.applyDprSizing();

    // Emit resize event if dimensions changed
    if (this._canvas.width !== oldWidth || this._canvas.height !== oldHeight) {
      this._events.emit("resize", this._canvas.width, this._canvas.height);
    }

    // Ensure renderer viewport matches canvas size immediately if running
    if (this._renderer) this._renderer.renderOnce();
  }

  applyOptions() {
    const { width, height, focusable } = this._options;
    if (typeof width === "number") {
      this._canvas.width = width;
    }
    if (typeof height === "number") {
      this._canvas.height = height;
    }
    if (focusable) {
      this._canvas.addEventListener("click", () => {
        this._canvas.focus();
      });
      this._canvas.setAttribute("tabindex", "0");
      this._canvas.addEventListener("focus", () => {
        this._isFocused = true;
        this._events.emit("focus");
      });
      this._canvas.addEventListener("blur", () => {
        this._isFocused = false;
        this._events.emit("blur");
      });
    }
  }

  setOptions(options: ArcanvasOptions) {
    Object.assign(this.options, options);
  }

  resetOptions() {
    Object.assign(this.options, _DEFAULT_ARCANVAS_OPTIONS);
  }

  use<T = unknown>(plugin: PluginLike<T>, opts?: T): Arcanvas {
    this._plugin.use(plugin as PluginLike, opts as T);
    return this;
  }

  destroy() {
    this.stop();
    if (this._currentCamera) {
      this._currentCamera.destroy();
      this._currentCamera = null;
    }
    this._plugin.destroyAll();
  }

  has<T = unknown>(plugin: PluginLike<T>): boolean {
    return this._plugin.has(plugin as PluginLike);
  }

  get<T = unknown>(plugin: PluginLike<T>): T | undefined {
    return this._plugin.get(plugin);
  }

  start() {
    this._renderer?.start();
  }

  stop() {
    this._renderer?.stop();
  }

  /**
   * Resize the canvas (in device pixels) and render a frame immediately.
   * @param width - The width of the canvas in device pixels.
   * @param height - The height of the canvas in device pixels.
   */
  resize(width: number, height: number): void {
    const oldWidth = this._canvas.width;
    const oldHeight = this._canvas.height;
    if (Number.isFinite(width) && width > 0) this._canvas.width = Math.floor(width);
    if (Number.isFinite(height) && height > 0) this._canvas.height = Math.floor(height);
    this._options.width = this._canvas.width;
    this._options.height = this._canvas.height;

    // Emit resize event if dimensions changed
    if (this._canvas.width !== oldWidth || this._canvas.height !== oldHeight) {
      this._events.emit("resize", this._canvas.width, this._canvas.height);
    }

    if (this._renderer) this._renderer.renderOnce();
  }

  private applyDprSizing(): void {
    const dpr = typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
    // Only auto-size when caller didn't explicitly pass numeric width/height
    const hasExplicitWidth = typeof this._options.width === "number" && this._options.width > 0;
    const hasExplicitHeight = typeof this._options.height === "number" && this._options.height > 0;
    if (!hasExplicitWidth || !hasExplicitHeight) {
      const parent = this._canvas.parentElement;
      if (parent) {
        const cssWidth = Math.max(0, Math.floor(parent.clientWidth || 0));
        const cssHeight = Math.max(0, Math.floor(parent.clientHeight || 0));
        const width = Math.max(0, Math.floor(cssWidth * dpr));
        const height = Math.max(0, Math.floor(cssHeight * dpr));
        if (width || height) this.resize(width || this._canvas.width, height || this._canvas.height);
      }
    }
  }

  isFocused(): boolean {
    return this._isFocused;
  }
}
