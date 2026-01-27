import type { Handle } from "./Handle";
import type { IHandleRenderer, RenderContext } from "../interfaces/IHandleRenderer";

/**
 * Collection of handles for a selected object.
 */
export class HandleSet {
  private _handles: Handle[] = [];

  /**
   * Gets all handles in this set.
   */
  get handles(): readonly Handle[] {
    return this._handles;
  }

  /**
   * Adds a handle to this set.
   */
  add(handle: Handle): void {
    this._handles.push(handle);
  }

  /**
   * Removes a handle from this set.
   */
  remove(handle: Handle): void {
    const index = this._handles.indexOf(handle);
    if (index >= 0) {
      this._handles.splice(index, 1);
    }
  }

  /**
   * Clears all handles from this set.
   */
  clear(): void {
    this._handles = [];
  }

  /**
   * Gets a handle at a specific point (for hit-testing).
   * @param point - Point to test in world coordinates
   * @param pixelSize - Size of a pixel in world units
   * @returns The handle at the point, or null if none found
   */
  getHandleAt(point: { x: number; y: number }, pixelSize: number = 1): Handle | null {
    // Test handles in reverse order (top-most first)
    for (let i = this._handles.length - 1; i >= 0; i--) {
      const handle = this._handles[i];
      if (handle.contains(point as { x: number; y: number }, pixelSize)) {
        return handle;
      }
    }
    return null;
  }

  /**
   * Renders all handles using the provided renderer.
   * @param renderer - The handle renderer to use
   * @param context - Rendering context
   */
  render(renderer: IHandleRenderer, context: RenderContext): void {
    renderer.renderHandleSet(this, context);
  }
}
