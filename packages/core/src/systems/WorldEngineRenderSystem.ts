import type { Camera } from "../camera/Camera";
import type { WorldCamera } from "../camera/WorldCamera";
import type { WorldScene } from "../scene/WorldScene";
import type { IRenderBackend } from "../rendering/engine/IRenderBackend";
import { createBackend, type BackendType } from "../rendering/engine/createBackend";
import { WorldRenderer } from "../rendering/engine/WorldRenderer";

/**
 * Options for WorldEngineRenderSystem.
 */
export interface WorldEngineRenderSystemOptions {
  /**
   * The backend to use for rendering.
   */
  backend: BackendType;
}

/**
 * WorldEngineRenderSystem is the top-level system for rendering large worlds.
 *
 * It combines:
 * - WorldScene: manages objects with world-space coordinates
 * - WorldCamera: camera with world-space position
 * - WorldRenderer: handles camera-relative rendering
 *
 * Usage:
 * ```ts
 * const scene = new WorldScene({ width: 800, height: 600 });
 * const camera = new WorldCamera(arc);
 *
 * // Add objects at world-space coordinates
 * const obj = new WorldRenderObject(mesh, material);
 * obj.setWorldPosition(1e12, 0, 0); // 1 trillion units away!
 * scene.addObject(obj);
 *
 * // Create render system
 * const renderSystem = new WorldEngineRenderSystem(canvas, scene, camera, {
 *   backend: 'webgl'
 * });
 *
 * // Render loop
 * function frame() {
 *   camera.move(10, 0, 0); // Camera can also be at huge coordinates
 *   renderSystem.renderOnce();
 *   requestAnimationFrame(frame);
 * }
 * ```
 *
 * The system handles all the complexity of:
 * - Floating origin / camera-relative rendering
 * - Automatic origin recentering when camera moves far
 * - Converting world coordinates to local coordinates for GPU
 * - Maintaining precision regardless of world scale
 */
export class WorldEngineRenderSystem {
  readonly backend: IRenderBackend;
  readonly renderer: WorldRenderer;
  private _scene: WorldScene;
  private _camera: Camera | WorldCamera;

  constructor(target: HTMLCanvasElement, scene: WorldScene, camera: Camera | WorldCamera, options: WorldEngineRenderSystemOptions) {
    this._scene = scene;
    this._camera = camera;
    this.backend = createBackend(target, options.backend);
    this.renderer = new WorldRenderer(this.backend);
  }

  /**
   * Gets the current scene.
   */
  get scene(): WorldScene {
    return this._scene;
  }

  /**
   * Gets the current camera.
   */
  get camera(): Camera | WorldCamera {
    return this._camera;
  }

  /**
   * Renders a single frame.
   */
  renderOnce(): void {
    this.renderer.render(this._scene, this._camera);
  }

  /**
   * Updates the scene reference.
   */
  setScene(scene: WorldScene): void {
    this._scene = scene;
  }

  /**
   * Updates the camera reference.
   */
  setCamera(camera: Camera | WorldCamera): void {
    this._camera = camera;
  }
}
