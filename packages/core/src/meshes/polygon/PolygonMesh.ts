import type { IRenderContext } from "../../rendering/context";
import { Mesh } from "../../scene/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
import { PolygonMaterial } from "./PolygonMaterial";

/**
 * Base class for polygon meshes that handles rendering with a shared material.
 */
export class PolygonMesh extends Mesh {
  private static _sharedMaterial: PolygonMaterial | null = null;
  private static _initPromise: Promise<void> | null = null;
  private _viewProjectionMatrix: TransformationMatrix | null = null;

  /**
   * Get or create the shared polygon material instance.
   */
  private static getMaterial(): PolygonMaterial {
    if (!PolygonMesh._sharedMaterial) {
      PolygonMesh._sharedMaterial = new PolygonMaterial();
    }
    return PolygonMesh._sharedMaterial;
  }

  /**
   * Ensure material is initialized. Returns true if ready, false if still initializing.
   */
  private static async ensureInitialized(ctx: IRenderContext): Promise<boolean> {
    const material = PolygonMesh.getMaterial();
    if (!PolygonMesh._initPromise) {
      PolygonMesh._initPromise = material.initialize(ctx);
    }
    try {
      await PolygonMesh._initPromise;
      return true;
    } catch (e) {
      console.error("[PolygonMesh] Material initialization failed:", e);
      PolygonMesh._initPromise = null;
      return false;
    }
  }

  /**
   * Set the view-projection matrix (combines view and projection).
   * If null, uses identity matrix (no transformation).
   */
  setViewProjection(matrix: TransformationMatrix | null): void {
    this._viewProjectionMatrix = matrix;
  }

  /**
   * Set the projection matrix (deprecated: use setViewProjection instead).
   * @deprecated Use setViewProjection instead
   */
  setProjectionMatrix(matrix: TransformationMatrix | null): void {
    this.setViewProjection(matrix);
  }

  override render(ctx: IRenderContext): void {
    const gl = ctx.getWebGLContext();
    if (!gl) {
      throw new Error("PolygonMesh requires WebGL context");
    }

    if (this.vertices.length === 0) {
      console.warn("[PolygonMesh] No vertices to render");
      return;
    }

    // Let base class handle buffer setup
    super.render(ctx);

    // Initialize material if needed (async, but we can't await in render)
    // So we'll check if it's ready, and if not, schedule initialization and return
    const material = PolygonMesh.getMaterial();
    if (!PolygonMesh._initPromise) {
      PolygonMesh._initPromise = material.initialize(ctx).catch((e) => {
        console.error("[PolygonMesh] Material initialization failed:", e);
        PolygonMesh._initPromise = null;
      });
    }

    // Try to bind material - it will throw if not initialized
    // In a production system, you might want to track initialization state
    // For now, we'll catch and return early if not ready
    const viewProjectionArray = this._viewProjectionMatrix ? this._viewProjectionMatrix.toColumnMajorArray() : null;
    try {
      material.bind(ctx, viewProjectionArray);
    } catch {
      // Material not ready yet, try again next frame
      return;
    }

    // Draw using indexed or non-indexed rendering
    if (this.indices.length > 0) {
      ctx.drawIndexed(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    } else {
      const vertCount = this.vertices.length / 3;
      ctx.drawArrays(gl.TRIANGLES, 0, vertCount);
    }
  }
}
