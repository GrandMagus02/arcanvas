import type { Camera } from "./Camera";

/**
 * Interface for camera controllers that handle input-based camera control.
 * Controllers manage user input (mouse, keyboard, touch) and translate it into camera movements.
 */
export interface ICameraController {
  /**
   * Attach the controller to a camera instance.
   * @param camera - The camera to control
   */
  attach(camera: Camera): void;

  /**
   * Detach the controller from the current camera.
   */
  detach(): void;

  /**
   * Handle mouse down event (e.g., start panning).
   * @param event - The mouse event
   */
  handleMouseDown(event: MouseEvent): void;

  /**
   * Handle mouse move event (e.g., continue panning).
   * @param event - The mouse event
   */
  handleMouseMove(event: MouseEvent): void;

  /**
   * Handle mouse up event (e.g., end panning).
   * @param event - The mouse event
   */
  handleMouseUp(event: MouseEvent): void;

  /**
   * Handle wheel event (e.g., zoom).
   * @param event - The wheel event
   */
  handleWheel(event: WheelEvent): void;

  /**
   * Enable the controller (start listening to events).
   */
  enable(): void;

  /**
   * Disable the controller (stop listening to events).
   */
  disable(): void;

  /**
   * Check if the controller is currently enabled.
   * @returns True if enabled, false otherwise
   */
  isEnabled(): boolean;
}
