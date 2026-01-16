import type { Camera } from "../../camera/Camera";
import type { Scene } from "../../scene/Scene";
import { toColumnMajor4x4 } from "../../utils/matrix";
import type { IRenderBackend, LightInfo } from "./IRenderBackend";

/**
 *
 */
export class Renderer {
  constructor(private backend: IRenderBackend) {}

  render(scene: Scene, camera: Camera): void {
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
