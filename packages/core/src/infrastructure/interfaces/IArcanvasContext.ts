import type { Camera } from "../../camera/Camera";
import type { IRenderer } from "../../rendering/backend/IRenderer";
import type { Stage } from "../../scene/Stage";
import type { ArcanvasEvents } from "../events/ArcanvasEvents";
import type { EventEmitter } from "./EventEmitter";

/**
 * Minimal interface for Arcanvas context that is used by plugins, Stage, Camera, and other subsystems.
 * This interface allows these components to work without directly depending on the Arcanvas class,
 * making the code more testable and following dependency inversion principle.
 */
export interface IArcanvasContext extends EventEmitter<ArcanvasEvents> {
  /**
   * The canvas element.
   */
  readonly canvas: HTMLCanvasElement;

  /**
   * The stage (scene graph root).
   */
  readonly stage: Stage;

  /**
   * The renderer instance.
   */
  readonly renderer: IRenderer;

  /**
   * The current active camera.
   */
  readonly camera: Camera | null;

  /**
   * Sets the active camera.
   */
  setCamera(camera: Camera | string | null): void;

  /**
   * Resize the canvas (in device pixels) and render a frame immediately.
   * @param width - The width of the canvas in device pixels.
   * @param height - The height of the canvas in device pixels.
   */
  resize(width: number, height: number): void;
}
