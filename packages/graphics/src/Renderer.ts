import type { DebugMode, DebugOptions } from "./DebugMode";
import { DEFAULT_DEBUG_OPTIONS } from "./DebugMode";
import type { IRenderBackend, LightInfo } from "./IRenderBackend";
import type { Mesh } from "./Mesh";
import type { BaseMaterial } from "./materials";

/**
 * Interface for scene that can be rendered.
 */
export interface RenderableScene {
  viewport: { width: number; height: number };
  lights: Array<{
    type: "directional" | "point" | "spot";
    position?: [number, number, number];
    direction?: [number, number, number];
    color: [number, number, number];
    intensity: number;
  }>;
  renderObjects: Array<{
    mesh: Mesh;
    material: BaseMaterial;
    transform: { modelMatrix: Float32Array };
  }>;
}

/**
 * Interface for camera.
 */
export interface RenderableCamera {
  view: { data: Float32Array };
  projection: { data: Float32Array };
  position: { x: number; y: number; z: number };
}

/**
 * Standard renderer for Scene and Camera.
 */
export class Renderer {
  constructor(private backend: IRenderBackend) {}

  /**
   * Sets the debug visualization mode.
   * @param mode - The debug mode to enable, or "none" to disable.
   * @param options - Additional debug options.
   */
  setDebugMode(mode: DebugMode, options?: Partial<Omit<DebugOptions, "mode">>): void {
    if (this.backend.setDebugMode) {
      this.backend.setDebugMode({
        ...DEFAULT_DEBUG_OPTIONS,
        ...options,
        mode,
      });
    }
  }

  /**
   * Gets the current debug options.
   */
  getDebugMode(): DebugOptions {
    if (this.backend.getDebugMode) {
      return this.backend.getDebugMode();
    }
    return { ...DEFAULT_DEBUG_OPTIONS };
  }

  /**
   * Convenience method to toggle debug triangles mode.
   * @param enabled - Whether to enable or disable debug triangles.
   * @param colorSeed - Optional seed for consistent colors.
   */
  setDebugTriangles(enabled: boolean, colorSeed?: number): void {
    this.setDebugMode(enabled ? "triangles" : "none", { colorSeed });
  }

  render(scene: RenderableScene, camera: RenderableCamera): void {
    const { width, height } = scene.viewport;
    this.backend.beginFrame(width, height);

    // Matrices are now stored in column-major order internally, so use directly
    const view = camera.view.toFloat32Array();
    const proj = camera.projection.toFloat32Array();
    const cameraPos = [camera.position.x, camera.position.y, camera.position.z] as [number, number, number];
    const lights: LightInfo[] = scene.lights.map((light) => ({
      type: light.type,
      position: light.position,
      direction: light.direction,
      color: light.color,
      intensity: light.intensity,
    }));

    for (const obj of scene.renderObjects) {
      this.backend.prepareMesh(obj.mesh);
      this.backend.prepareMaterial(obj.material);
      this.backend.drawMesh({
        mesh: obj.mesh,
        material: obj.material,
        modelMatrix: obj.transform.modelMatrix,
        viewMatrix: view,
        projMatrix: proj,
        cameraPosition: cameraPos,
        lights,
      });
    }

    this.backend.endFrame();
  }
}
