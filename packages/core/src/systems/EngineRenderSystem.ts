import type { Camera } from "../camera/Camera";
import type { Scene } from "../scene/Scene";
import { Renderer } from "../rendering/engine/Renderer";
import type { IRenderBackend } from "../rendering/engine/IRenderBackend";
import { createBackend, type BackendType } from "../rendering/engine/createBackend";

/**
 *
 */
export interface EngineRenderSystemOptions {
  backend: BackendType;
}

/**
 * Render system for the engine-level renderer/backends.
 */
export class EngineRenderSystem {
  readonly backend: IRenderBackend;
  readonly renderer: Renderer;

  constructor(
    target: HTMLCanvasElement,
    private scene: Scene,
    private camera: Camera,
    options: EngineRenderSystemOptions
  ) {
    this.backend = createBackend(target, options.backend);
    this.renderer = new Renderer(this.backend);
  }

  renderOnce(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
