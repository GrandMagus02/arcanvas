import type { Handle } from "../core/Handle";
import type { BoundingBox } from "./ISelectable";

/**
 * Drag information passed to adorner when a handle is dragged.
 * Aligns with HandleInteractionData delta semantics.
 */
export interface DragInfo {
  /** Starting position in world coordinates. */
  startPosition: { x: number; y: number };
  /** Current position in world coordinates. */
  currentPosition: { x: number; y: number };
  /** Delta from start to current. */
  delta: { x: number; y: number };
  /** Incremental delta from last update. */
  incrementalDelta: { x: number; y: number };
}

/**
 * Strategy interface for selection adorners.
 * Each element type (or group) can provide an adorner that defines bounds, handles,
 * how drag applies (transform vs parametric), and optional mesh visuals for WebGL.
 *
 * @typeParam T - Element type (e.g. IElement, ISelectable, or Element[] for groups).
 * @typeParam TRenderable - Type returned by getMeshes (e.g. unknown in selection package; RenderObject in feature-2d).
 */
export interface ISelectionAdorner<T, TRenderable = unknown> {
  /**
   * Bounds used for hit-test and layout.
   * @param el - The element (or array for group adorners).
   * @returns Bounding box in world space, or null if no bounds.
   */
  getBounds(el: T): BoundingBox | null;

  /**
   * Handles with positions, cursors, and stable ids for drag routing.
   * Adorners must set Handle.id for each handle so dragHandle(el, handleId, drag) can route correctly.
   * @param el - The element (or array for group adorners).
   * @returns List of handles.
   */
  getHandles(el: T): Handle[];

  /**
   * Apply drag for a specific handle.
   * @param el - The element (or array for group adorners).
   * @param handleId - Id of the handle being dragged (Handle.id).
   * @param drag - Drag info (start, current, delta).
   */
  dragHandle(el: T, handleId: string, drag: DragInfo): void;

  /**
   * Optional: meshes for selection outline, handles, and extra guides.
   * Everything is a mesh — the engine renders these via normal WebGL mesh rendering.
   * Selection package uses TRenderable = unknown; feature-2d implements with RenderObject[].
   * @param el - The element (or array for group adorners).
   * @param context - Optional context (e.g. { camera } for screen-space handle sizing). Package-agnostic (unknown).
   * @returns Array of renderables (e.g. RenderObject[]) to submit to the pipeline.
   */
  getMeshes?(el: T, context?: unknown): TRenderable[];
}
