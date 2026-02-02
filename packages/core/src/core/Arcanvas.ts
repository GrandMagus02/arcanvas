import type { Camera } from "../camera/Camera";
import { CanvasHost, type CanvasOptions, DEFAULT_CANVAS_OPTIONS } from "../infrastructure/canvas/CanvasHost";
import type { ArcanvasEvents } from "../infrastructure/events/ArcanvasEvents";
import { EventBus } from "../infrastructure/events/EventBus";
import type { Configurable, EventEmitter, Focusable, IArcanvasContext, Lifecycle, PluginHost } from "../infrastructure/interfaces";
import type { PluginLike } from "../plugins/Plugin";
import type { Backend } from "../rendering/backend/createRenderer";
import type { IRenderer } from "../rendering/backend/IRenderer";
import type { RendererOptions } from "../rendering/backend/types";
import type { Stage } from "../scene/Stage";
import { PluginSystem } from "../systems/PluginSystem";
import { RenderSystem } from "../systems/RenderSystem";
import { SceneSystem } from "../systems/SceneSystem";

/**
 * Options for configuring an `Arcanvas` instance.
 */
export interface ArcanvasOptions extends CanvasOptions {
  /**
   * Rendering backend to use. Defaults to "webgl".
   */
  backend?: Backend;
  /**
   * Options for the renderer (clear color, depth test, etc.).
   */
  rendererOptions?: Partial<RendererOptions>;
  [key: string]: unknown;
}

/**
 * Default `Arcanvas` options.
 */
const DEFAULT_ARCANVAS_OPTIONS: ArcanvasOptions = Object.freeze({
  ...DEFAULT_CANVAS_OPTIONS,
  backend: "webgl",
});

/**
 * Arcanvas is a facade class that coordinates multiple subsystems:
 * - CanvasHost: DOM canvas, dimensions, DPR, focus
 * - EventSystem: Event bus wrapper
 * - SceneSystem: Stage and cameras
 * - RenderSystem: Rendering backend and connection to stage
 * - PluginSystem: Plugin management
 *
 * Implements multiple interfaces for event handling, configuration, lifecycle management, plugin hosting, and focus management.
 */
export class Arcanvas implements IArcanvasContext, EventEmitter<ArcanvasEvents>, Configurable<ArcanvasOptions>, Lifecycle, PluginHost<Arcanvas>, Focusable {
  private _options: ArcanvasOptions = { ...DEFAULT_ARCANVAS_OPTIONS };

  private _events: EventBus<ArcanvasEvents>;
  private _canvasHost: CanvasHost<ArcanvasEvents>;
  private _scene: SceneSystem;
  private _renderSystem: RenderSystem;
  private _plugins: PluginSystem<Arcanvas>;

  constructor(canvas: HTMLCanvasElement, options: Partial<ArcanvasOptions> = {}) {
    this._options = { ...DEFAULT_ARCANVAS_OPTIONS, ...options };

    // 1. Event system
    this._events = new EventBus<ArcanvasEvents>();

    // 2. Canvas host (DOM + DPR + focus)
    this._canvasHost = new CanvasHost<ArcanvasEvents>(canvas, this._options, this._events);

    // 3. Scene (Stage + CameraManager)
    this._scene = new SceneSystem(this);

    // 4. Renderer (backend + IRenderContext + connection to Stage)
    const backend: Backend = this._options.backend ?? "webgl";
    const rendererOptions: Partial<RendererOptions> = this._options.rendererOptions ?? {};
    this._renderSystem = new RenderSystem(this._canvasHost.canvas, this._scene.stage, {
      backend,
      rendererOptions,
    });

    // 5. Plugins
    this._plugins = new PluginSystem<Arcanvas>(this);
  }

  // ----- Getters / Delegates -----

  get canvas(): HTMLCanvasElement {
    return this._canvasHost.canvas;
  }

  get options(): ArcanvasOptions {
    return this._options;
  }

  set options(options: ArcanvasOptions) {
    this.updateOptions(options);
  }

  get stage(): Stage {
    return this._scene.stage;
  }

  get renderer(): IRenderer {
    return this._renderSystem.renderer;
  }

  get camera(): Camera | null {
    return this._scene.camera;
  }

  setCamera(camera: Camera | string | null): void {
    this._scene.setCamera(camera);
  }

  // ----- EventEmitter interface -----

  on<K extends keyof ArcanvasEvents>(event: K, fn: (...args: ArcanvasEvents[K]) => void): () => void {
    return this._events.on(event, fn);
  }

  once<K extends keyof ArcanvasEvents>(event: K, fn: (...args: ArcanvasEvents[K]) => void): () => void {
    return this._events.once(event, fn);
  }

  off<K extends keyof ArcanvasEvents>(event: K, fn: (...args: ArcanvasEvents[K]) => void): void {
    this._events.off(event, fn);
  }

  emit<K extends keyof ArcanvasEvents>(event: K, ...args: ArcanvasEvents[K]): void {
    this._events.emit(event, ...args);
  }

  // ----- Configurable interface -----

  getOptions(): ArcanvasOptions {
    return this._options;
  }

  updateOptions(options: Partial<ArcanvasOptions>): void {
    Object.assign(this._options, options);
    // Canvas part
    this._canvasHost.updateOptions(this._options);

    // If rendererOptions/backend changed, we could recreate renderer here
    this._renderSystem.renderOnce();
  }

  setOptions(options: ArcanvasOptions): void {
    this.updateOptions(options);
  }

  resetOptions(): void {
    this.updateOptions(DEFAULT_ARCANVAS_OPTIONS);
  }

  // ----- PluginHost interface -----

  use<T = unknown>(plugin: PluginLike<T>, opts?: T): Arcanvas {
    this._plugins.use(plugin, opts);
    return this;
  }

  has(plugin: PluginLike): boolean {
    return this._plugins.has(plugin);
  }

  get<T = unknown>(plugin: PluginLike<T>): T | undefined {
    return this._plugins.get(plugin);
  }

  // ----- Lifecycle interface -----

  start(): void {
    this._renderSystem.start();
  }

  stop(): void {
    this._renderSystem.stop();
  }

  destroy(): void {
    this.stop();
    this._scene.destroy();
    this._plugins.destroyAll();
  }

  // ----- Focusable interface -----

  isFocused(): boolean {
    return this._canvasHost.isFocused;
  }

  // ----- Additional convenience methods -----

  /**
   * Resize the canvas (in device pixels) and render a frame immediately.
   * @param width - The width of the canvas in device pixels.
   * @param height - The height of the canvas in device pixels.
   */
  resize(width: number, height: number): void {
    this._canvasHost.resize(width, height);
    this._renderSystem.renderOnce();
  }

  /**
   * Sets the resolution scale multiplier (DPR * scale) for pixelation/debug.
   * @param scale - Resolution scale (e.g., 0.5 for pixelated, 2 for supersampling)
   */
  setResolutionScale(scale: number): void {
    this._canvasHost.setResolutionScale(scale);
    this._renderSystem.renderOnce();
  }
}
