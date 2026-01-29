import { createBackend, type BackendType } from "@arcanvas/backend-webgl";
import type { DebugMode, DebugOptions, IRenderBackend } from "@arcanvas/graphics";
import { Renderer } from "@arcanvas/graphics";
import type { Scene } from "@arcanvas/scene";
import type { Camera } from "../camera/Camera";

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

  /**
   * Sets the debug visualization mode.
   * @param mode - The debug mode to enable, or "none" to disable.
   * @param options - Additional debug options.
   */
  setDebugMode(mode: DebugMode, options?: Partial<Omit<DebugOptions, "mode">>): void {
    this.renderer.setDebugMode(mode, options);
  }

  /**
   * Gets the current debug options.
   */
  getDebugMode(): DebugOptions {
    return this.renderer.getDebugMode();
  }

  /**
   * Convenience method to toggle debug triangles mode (like UE4/UE5).
   * @param enabled - Whether to enable or disable debug triangles.
   * @param colorSeed - Optional seed for consistent colors across frames.
   */
  setDebugTriangles(enabled: boolean, colorSeed?: number): void {
    this.renderer.setDebugTriangles(enabled, colorSeed);
  }
}
