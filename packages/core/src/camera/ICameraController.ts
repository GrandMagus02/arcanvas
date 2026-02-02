import type { Camera } from "./Camera";
import type { CameraRig } from "./CameraRig";

/**
 * Represents the current state of input devices for camera control.
 * This state is collected and normalized by the CameraRig and passed to controllers.
 */
export interface CameraInputState {
  /**
   * Set of currently pressed keyboard keys (e.g., "w", "ArrowUp", "Shift").
   */
  keysDown: Set<string>;

  /**
   * Current state of modifier keys.
   */
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };

  /**
   * Map of active pointer inputs (mouse, touch, pen).
   * Key is the pointer ID.
   */
  pointers: Map<
    number,
    {
      position: { x: number; y: number };
      buttons: number[];
      type: "mouse" | "touch" | "pen";
    }
  >;

  /**
   * Wheel delta from the current frame, or null if no wheel event occurred.
   * Values are normalized (positive = scroll down/zoom out).
   */
  wheelDelta: { x: number; y: number; z: number; deltaMode: number } | null;

  /**
   * Current viewport dimensions.
   */
  viewport: { width: number; height: number };

  /**
   * Time since last update in seconds.
   */
  deltaTime: number;
}

/**
 * Strategy interface for pluggable camera behaviors.
 * Controllers implement specific input handling logic (zoom, pan, keyboard movement, etc.)
 * and are composed together via CameraRig.
 */
export interface ICameraController {
  /**
   * Unique identifier for this controller type.
   * Used for retrieval and conflict resolution.
   */
  readonly id: string;

  /**
   * Whether this controller is currently enabled.
   * Disabled controllers are skipped during update.
   */
  enabled: boolean;

  /**
   * Priority for update order. Higher priority controllers update first.
   * Default is 0. Zoom typically has highest priority (100), pan medium (50), keyboard lowest (10).
   */
  priority?: number;

  /**
   * Called when the controller is attached to a CameraRig.
   * Use this for initialization that requires the rig or camera reference.
   * @param rig - The CameraRig this controller is being attached to
   */
  onAttach?(rig: CameraRig): void;

  /**
   * Called when the controller is detached from a CameraRig.
   * Use this for cleanup.
   * @param rig - The CameraRig this controller is being detached from
   */
  onDetach?(rig: CameraRig): void;

  /**
   * Process input and update camera state.
   * Called each frame by the CameraRig.
   *
   * @param dt - Delta time in seconds since last update
   * @param camera - The camera to update
   * @param input - Current input state
   * @returns true if this controller consumed the input (prevents lower-priority controllers from processing)
   */
  update(dt: number, camera: Camera, input: CameraInputState): boolean;
}

/**
 * @deprecated Use ICameraController instead. This interface is kept for backward compatibility.
 * Legacy interface for camera controllers that handle input-based camera control.
 * Controllers manage user input (mouse, keyboard, touch) and translate it into camera movements.
 */
export interface ICameraControllerLegacy {
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
