import type { IRenderContext } from "../../rendering/context";
import { Mesh } from "../../scene/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
import { PolygonMaterial } from "./PolygonMaterial";
import type { PolygonFill } from "./fills/PolygonFill";
import { SolidFill } from "./fills/SolidFill";

/**
 * Base class for polygon meshes that handles rendering with a shared material.
 */
export class PolygonMesh extends Mesh {
  private static _materials = new Map<string, PolygonMaterial>();
  private static _initPromises = new Map<string, Promise<void>>();
  private _viewProjectionMatrix: TransformationMatrix | null = null;
  private _fill: PolygonFill;

  /**
   * Get or create the shared polygon material instance.
   */
  private static getMaterial(fill: PolygonFill): PolygonMaterial {
    const key = fill.getCacheKey();
    const existing = PolygonMesh._materials.get(key);
    if (existing) return existing;
    const material = new PolygonMaterial();
    PolygonMesh._materials.set(key, material);
    return material;
  }

  /**
   * Ensure material is initialized. Returns true if ready, false if still initializing.
   */
  private static async ensureInitialized(ctx: IRenderContext, fill: PolygonFill): Promise<boolean> {
    const key = fill.getCacheKey();
    const material = PolygonMesh.getMaterial(fill);
    if (!PolygonMesh._initPromises.has(key)) {
      PolygonMesh._initPromises.set(key, material.initialize(ctx, fill));
    }
    try {
      await PolygonMesh._initPromises.get(key);
      return true;
    } catch (e) {
      console.error("[PolygonMesh] Material initialization failed:", e);
      PolygonMesh._initPromises.delete(key);
      return false;
    }
  }

  constructor(vertices: Float32Array, indices: Uint16Array, fill: PolygonFill = new SolidFill({ r: 0, g: 1, b: 0, a: 1 })) {
    super(vertices, indices);
    this._fill = fill;
  }

  /**
   * Set the view-projection matrix (combines view and projection).
   * If null, uses identity matrix (no transformation).
   */
  setViewProjection(matrix: TransformationMatrix | null): void {
    this._viewProjectionMatrix = matrix;
  }

  setFill(fill: PolygonFill): void {
    this._fill = fill;
  }

  getFill(): PolygonFill {
    return this._fill;
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
    const fill = this._fill;
    const material = PolygonMesh.getMaterial(fill);
    const key = fill.getCacheKey();
    if (!PolygonMesh._initPromises.has(key)) {
      const initPromise = material.initialize(ctx, fill).catch((e) => {
        console.error("[PolygonMesh] Material initialization failed:", e);
        PolygonMesh._initPromises.delete(key);
      });
      PolygonMesh._initPromises.set(key, initPromise);
    }

    // Try to bind material - it will throw if not initialized
    // In a production system, you might want to track initialization state
    // For now, we'll catch and return early if not ready
    const viewProjectionArray = this._viewProjectionMatrix ? this._viewProjectionMatrix.toColumnMajorArray() : null;
    try {
      material.bind(ctx, viewProjectionArray, fill);
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
