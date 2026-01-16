import type { IRenderContext } from "../../../rendering/context";

/**
 * Uniform locations for a polygon fill.
 */
export type PolygonFillUniformLocations = Record<string, number | null>;

/**
 * Fill strategy for polygon meshes.
 * Implementations provide shader source and uniforms.
 */
export interface PolygonFill {
  /**
   * Stable key for caching programs by shader layout.
   * Do not include per-instance uniform values.
   */
  getCacheKey(): string;

  /**
   * Fragment shader source for this fill.
   */
  getFragmentSource(): string;

  /**
   * Cache uniform locations after program creation.
   */
  getUniformLocations(gl: WebGLRenderingContext, program: WebGLProgram): PolygonFillUniformLocations;

  /**
   * Apply per-draw uniforms for this fill.
   */
  applyUniforms(ctx: IRenderContext, locations: PolygonFillUniformLocations): void;
}
