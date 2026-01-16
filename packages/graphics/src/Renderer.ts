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
 * Converts a row-major 4x4 matrix to column-major for WebGL.
 */
function toColumnMajor4x4(rowMajor: Float32Array): Float32Array {
  if (rowMajor.length !== 16) {
    throw new Error("Matrix must have exactly 16 elements");
  }
  return new Float32Array([
    rowMajor[0]!,
    rowMajor[4]!,
    rowMajor[8]!,
    rowMajor[12]!,
    rowMajor[1]!,
    rowMajor[5]!,
    rowMajor[9]!,
    rowMajor[13]!,
    rowMajor[2]!,
    rowMajor[6]!,
    rowMajor[10]!,
    rowMajor[14]!,
    rowMajor[3]!,
    rowMajor[7]!,
    rowMajor[11]!,
    rowMajor[15]!,
  ]);
}

/**
 * Standard renderer for Scene and Camera.
 */
export class Renderer {
  constructor(private backend: IRenderBackend) {}

  render(scene: RenderableScene, camera: RenderableCamera): void {
    const { width, height } = scene.viewport;
    this.backend.beginFrame(width, height);

    const view = toColumnMajor4x4(camera.view.data);
    const proj = toColumnMajor4x4(camera.projection.data);
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
