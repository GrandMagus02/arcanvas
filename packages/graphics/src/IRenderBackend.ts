import type { DebugOptions } from "./DebugMode";
import type { Mesh } from "./Mesh";
import type { BaseMaterial } from "./materials";

/**
 * Light information for rendering.
 */
export interface LightInfo {
  type: "directional" | "point" | "spot";
  position?: [number, number, number];
  direction?: [number, number, number];
  color: [number, number, number];
  intensity: number;
}

/**
 * Arguments for drawing a mesh.
 */
export interface DrawArgs {
  mesh: Mesh;
  material: BaseMaterial;
  modelMatrix: Float32Array;
  viewMatrix: Float32Array;
  projMatrix: Float32Array;
  cameraPosition: [number, number, number];
  lights: LightInfo[];
}

/**
 * Render backend interface.
 *
 * This is the low-level contract for GPU/CPU resource management.
 * Implementations translate abstract Mesh/Material data into API calls.
 */
export interface IRenderBackend {
  /**
   * Begins a new frame, setting up viewport and clearing buffers.
   */
  beginFrame(viewportWidth: number, viewportHeight: number): void;

  /**
   * Ends the current frame.
   */
  endFrame(): void;

  /**
   * Prepares mesh data for rendering (creates/updates buffers).
   */
  prepareMesh(mesh: Mesh): void;

  /**
   * Prepares material for rendering (creates/updates textures, pipelines).
   */
  prepareMaterial(material: BaseMaterial): void;

  /**
   * Draws a mesh with the given arguments.
   */
  drawMesh(args: DrawArgs): void;

  /**
   * Sets the debug visualization mode.
   * When enabled, overrides normal rendering with debug visualizations.
   */
  setDebugMode?(options: DebugOptions): void;

  /**
   * Gets the current debug options.
   */
  getDebugMode?(): DebugOptions;

  /**
   * Disposes of all resources held by this backend.
   */
  dispose?(): void;
}
