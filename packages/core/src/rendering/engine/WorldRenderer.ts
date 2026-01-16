import type { Camera } from "../../camera/Camera";
import type { WorldCamera } from "../../camera/WorldCamera";
import type { RenderObject } from "../../scene/RenderObject";
import type { WorldScene } from "../../scene/WorldScene";
import type { WorldRenderObject } from "../../scene/WorldRenderObject";
import { toColumnMajor4x4 } from "../../utils/matrix";
import { WorldVec3, createWorldVec3 } from "../../utils/world/WorldVec3";
import type { IRenderBackend, LightInfo } from "./IRenderBackend";

/**
 * WorldRenderer extends Renderer with camera-relative rendering for large worlds.
 *
 * Key difference from standard Renderer:
 * - Objects with WorldTransform have their model matrices computed relative to camera
 * - The view matrix represents camera orientation only (no translation)
 * - This keeps all values small and avoids Float32 precision issues
 *
 * The math works out the same:
 *   Standard: clipPos = proj * view * model * vertexPos
 *   Camera-relative: clipPos = proj * (view * (model_relative_to_camera * vertexPos))
 *
 * Where model_relative_to_camera has translation = objectWorldPos - cameraWorldPos
 * and view has no translation (or just rotation for 3D).
 */
export class WorldRenderer {
  // Pre-allocated arrays to avoid GC pressure
  private readonly _modelMatrix = new Float32Array(16);
  private readonly _cameraPos: [number, number, number] = [0, 0, 0];

  constructor(private backend: IRenderBackend) {}

  /**
   * Renders a WorldScene with camera-relative coordinates.
   *
   * @param scene The scene to render
   * @param camera The camera (must have worldPosition for proper results)
   */
  render(scene: WorldScene, camera: Camera | WorldCamera): void {
    const { width, height } = scene.viewport;
    this.backend.beginFrame(width, height);

    // Get camera world position
    const cameraWorldPos: WorldVec3 = this._getCameraWorldPosition(camera);

    // Update scene for this camera position (handles origin recentering)
    scene.updateForCamera(cameraWorldPos);

    // Get view and projection matrices
    // For camera-relative rendering, view is identity or rotation-only
    const view = toColumnMajor4x4(camera.view.data);
    const proj = toColumnMajor4x4(camera.projection.data);

    // Camera position for shaders (in local/relative coords, always near origin)
    // For camera-relative rendering, camera is always at (0,0,0) in local space
    this._cameraPos[0] = 0;
    this._cameraPos[1] = 0;
    this._cameraPos[2] = 0;

    // Gather lights
    const lights: LightInfo[] = scene.lights.map((light) => ({
      type: light.type,
      position: light.position,
      direction: light.direction,
      color: light.color,
      intensity: light.intensity,
    }));

    // Render all objects
    for (const obj of scene.renderObjects) {
      this._renderObject(obj, cameraWorldPos, view, proj, lights);
    }

    this.backend.endFrame();
  }

  /**
   * Renders a single object with camera-relative positioning.
   */
  private _renderObject(obj: RenderObject | WorldRenderObject, cameraWorldPos: WorldVec3, view: Float32Array, proj: Float32Array, lights: LightInfo[]): void {
    // Prepare mesh and material
    this.backend.prepareMesh(obj.mesh);
    this.backend.prepareMaterial(obj.material);

    // Get or compute the model matrix
    let modelMatrix: Float32Array;

    if (this._isWorldRenderObject(obj)) {
      // WorldRenderObject: use the pre-computed local position from WorldTransform
      // The transform.modelMatrix already contains the camera-relative position
      modelMatrix = obj.transform.modelMatrix;
    } else {
      // Regular RenderObject: use its model matrix directly
      // This maintains backward compatibility
      modelMatrix = obj.transform.modelMatrix;
    }

    // Draw
    this.backend.drawMesh({
      mesh: obj.mesh,
      material: obj.material,
      modelMatrix,
      viewMatrix: view,
      projMatrix: proj,
      cameraPosition: this._cameraPos,
      lights,
    });
  }

  /**
   * Type guard for WorldRenderObject.
   */
  private _isWorldRenderObject(obj: RenderObject | WorldRenderObject): obj is WorldRenderObject {
    return "worldPosition" in obj;
  }

  /**
   * Gets the camera's world position, handling both Camera and WorldCamera.
   */
  private _getCameraWorldPosition(camera: Camera | WorldCamera): WorldVec3 {
    if ("worldPositionRef" in camera) {
      // WorldCamera
      return camera.worldPositionRef as WorldVec3;
    } else {
      // Regular Camera - use its position (may lose precision for large values)
      const pos = camera.position;
      return createWorldVec3(pos.x, pos.y, pos.z);
    }
  }
}
