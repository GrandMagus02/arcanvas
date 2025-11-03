import type { Arcanvas } from "../Arcanvas";
import { EventBus } from "../EventBus";
import { EventKey } from "../utils";
import { ProjectionMatrix } from "../utils/ProjectionMatrix";

/**
 * Base Camera class that controls the view and projection.
 * Cameras are not Nodes - they are separate instances that control what is rendered.
 */
export abstract class Camera {
  protected readonly app: Arcanvas;
  protected readonly events: EventBus;

  protected _projection: ProjectionMatrix = new ProjectionMatrix();
  protected _isProjectionDirty: boolean = true;

  private _unsubscribeResize: (() => void) | null = null;
  private _active: boolean = false;

  constructor(app: Arcanvas) {
    this.app = app;
    this.events = new EventBus();

    // Subscribe to resize events from Arcanvas
    this._unsubscribeResize = this.app.on(EventKey.Resize, () => {
      this._isProjectionDirty = true;
      this.events.emit(EventKey.Resize, this.app.canvas.width, this.app.canvas.height);
    });
  }

  /**
   * Get the projection matrix for this camera.
   * The matrix is cached and only recalculated when dimensions change.
   */
  getProjection(): ProjectionMatrix {
    if (this._isProjectionDirty) {
      this.updateProjection();
      this._isProjectionDirty = false;
    }
    return this._projection;
  }

  /**
   * Update the projection matrix. Must be implemented by subclasses.
   */
  protected abstract updateProjection(): void;

  /**
   * Subscribe to camera events.
   */
  on(event: string, fn: (...args: unknown[]) => void): () => void {
    return this.events.on(event, fn);
  }

  /**
   * Unsubscribe from camera events.
   */
  off(event: string, fn: (...args: unknown[]) => void): void {
    this.events.off(event, fn);
  }

  /**
   * Emit a camera event.
   */
  protected emit(event: string, ...args: unknown[]): void {
    this.events.emit(event, ...args);
  }

  /**
   * Called when this camera becomes active.
   */
  activate(): void {
    if (this._active) return;
    this._active = true;
    this.onActivate();
    this.events.emit("activate");
    // Ensure renderer is running when camera is active
    if (this.app && typeof (this.app as { start?: () => void }).start === "function") {
      (this.app as { start: () => void }).start();
    }
  }

  /**
   * Called when this camera becomes inactive.
   */
  deactivate(): void {
    if (!this._active) return;
    this._active = false;
    this.onDeactivate();
    this.events.emit("deactivate");
  }

  /**
   * Check if this camera is currently active.
   */
  get active(): boolean {
    return this._active;
  }

  /**
   * Override this method to handle activation (e.g., set up event listeners).
   */
  protected onActivate(): void {
    // Override in subclasses
  }

  /**
   * Override this method to handle deactivation (e.g., clean up event listeners).
   */
  protected onDeactivate(): void {
    // Override in subclasses
  }

  /**
   * Clean up resources when camera is destroyed.
   */
  destroy(): void {
    this.deactivate();
    if (this._unsubscribeResize) {
      this._unsubscribeResize();
      this._unsubscribeResize = null;
    }
  }
}
