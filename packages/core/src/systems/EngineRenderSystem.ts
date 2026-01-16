import type { Camera } from "../camera/Camera";
import type { Scene } from "@arcanvas/scene";
import { Renderer } from "@arcanvas/graphics";
import type { IRenderBackend } from "@arcanvas/graphics";
import { createBackend, type BackendType } from "@arcanvas/backend-webgl";

/**
 * Options for EngineRenderSystem.
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
