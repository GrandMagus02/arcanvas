import { WorldVec3 } from "@arcanvas/scene";
import type { IRenderBackend, LightInfo } from "./IRenderBackend";
import type { Mesh } from "./Mesh";
import type { RenderableCamera } from "./Renderer";
import type { BaseMaterial } from "./materials";

/**
 * Interface for world camera with high-precision position.
 */
export interface WorldRenderableCamera extends RenderableCamera {
  worldPositionRef?: WorldVec3;
}

/**
 * Interface for world scene with floating origin support.
 */
export interface WorldRenderableScene {
  viewport: { width: number; height: number };
  lights: Array<{
    type: LightInfo["type"];
    position?: [number, number, number];
    direction?: [number, number, number];
    color: [number, number, number];
    intensity: number;
  }>;
  renderObjects: Array<{
    mesh: Mesh;
    material: BaseMaterial;
    transform: { modelMatrix: Float32Array };
    worldPosition?: WorldVec3;
  }>;
  updateForCamera(cameraWorldPos: WorldVec3): boolean;
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
  private readonly _cameraPos: [number, number, number] = [0, 0, 0];

  constructor(private backend: IRenderBackend) {}

  /**
   * Renders a WorldScene with camera-relative coordinates.
   *
   * @param scene The scene to render
   * @param camera The camera (must have worldPosition for proper results)
   */
  render(scene: WorldRenderableScene, camera: WorldRenderableCamera): void {
    const { width, height } = scene.viewport;
    this.backend.beginFrame(width, height);

    // Get camera world position
    const cameraWorldPos: WorldVec3 = this._getCameraWorldPosition(camera);

    // Update scene for this camera position (handles origin recentering)
    scene.updateForCamera(cameraWorldPos);

    // Get view and projection matrices
    // For camera-relative rendering, view is identity or rotation-only
    // Matrices are now stored in column-major order internally, so use directly
    const view = camera.view.toFloat32Array();
    const proj = camera.projection.toFloat32Array();

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
      this._renderObject(obj, view, proj, lights);
    }

    this.backend.endFrame();
  }

  /**
   * Renders a single object with camera-relative positioning.
   */
  private _renderObject(
    obj: { mesh: Mesh; material: BaseMaterial; transform: { modelMatrix: Float32Array }; worldPosition?: WorldVec3 },
    view: Float32Array,
    proj: Float32Array,
    lights: LightInfo[]
  ): void {
    // Prepare mesh and material
    this.backend.prepareMesh(obj.mesh);
    this.backend.prepareMaterial(obj.material);

    // Get or compute the model matrix
    // The transform.modelMatrix already contains the camera-relative position
    const modelMatrix = obj.transform.modelMatrix;

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
   * Gets the camera's world position, handling both Camera and WorldCamera.
   */
  private _getCameraWorldPosition(camera: WorldRenderableCamera): WorldVec3 {
    if (camera.worldPositionRef) {
      // WorldCamera
      return camera.worldPositionRef;
    } else {
      // Regular Camera - use its position (may lose precision for large values)
      const pos = camera.position;
      return new WorldVec3(pos.x, pos.y, pos.z);
    }
  }
}
