import type { Mesh } from "./Mesh";
import type { BaseMaterial } from "./materials";

/**
 *
 */
export interface LightInfo {
  type: "directional" | "point" | "spot";
  position?: [number, number, number];
  direction?: [number, number, number];
  color: [number, number, number];
  intensity: number;
}

/**
 *
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
 *
 */
export interface IRenderBackend {
  beginFrame(viewportWidth: number, viewportHeight: number): void;
  endFrame(): void;
  prepareMesh(mesh: Mesh): void;
  prepareMaterial(material: BaseMaterial): void;
  drawMesh(args: DrawArgs): void;
}
