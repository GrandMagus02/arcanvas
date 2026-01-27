import type { Handle } from "../core/Handle";
import type { HandleSet } from "../core/HandleSet";

/**
 * Interface for rendering selection handles.
 * Dimension-specific implementations (HandleRenderer2D, HandleRenderer3D) should implement this.
 */
export interface IHandleRenderer {
  /**
   * Renders a single handle.
   * @param handle - The handle to render
   * @param context - Rendering context (camera, viewport, etc.)
   */
  renderHandle(handle: Handle, context: RenderContext): void;

  /**
   * Renders a set of handles (typically all handles for a selected object).
   * @param handleSet - The set of handles to render
   * @param context - Rendering context
   */
  renderHandleSet(handleSet: HandleSet, context: RenderContext): void;

  /**
   * Renders the selection outline (bounding box border).
   * @param bounds - The bounding box to outline
   * @param context - Rendering context
   */
  renderOutline(bounds: unknown, context: RenderContext): void;
}

/**
 * Rendering context passed to handle renderers.
 * Contains camera, viewport, and other rendering state.
 */
export interface RenderContext {
  camera: unknown; // Camera type from @arcanvas/core
  viewport: { width: number; height: number };
  [key: string]: unknown; // Allow additional context properties
}
