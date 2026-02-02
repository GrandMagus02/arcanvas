import type { Camera } from "../Camera";
import type { CameraRig } from "../CameraRig";
import type { CameraInputState, ICameraController } from "../ICameraController";

/**
 * Options for configuring a CameraKeyboardController.
 */
export interface CameraKeyboardControllerOptions {
  /**
   * Keys that trigger upward movement (default: ["w", "W", "ArrowUp"]).
   */
  keysUp?: string[];

  /**
   * Keys that trigger downward movement (default: ["s", "S", "ArrowDown"]).
   */
  keysDown?: string[];

  /**
   * Keys that trigger leftward movement (default: ["a", "A", "ArrowLeft"]).
   */
  keysLeft?: string[];

  /**
   * Keys that trigger rightward movement (default: ["d", "D", "ArrowRight"]).
   */
  keysRight?: string[];

  /**
   * Base movement speed in world units per second (default: 100.0).
   * Movement is frame-rate independent.
   */
  keyboardMoveSpeed?: number;

  /**
   * Movement speed multiplier when Shift is held (default: 2.0).
   */
  shiftMultiplier?: number;

  /**
   * Movement speed multiplier when Ctrl is held (default: 0.5).
   */
  ctrlMultiplier?: number;

  /**
   * Invert Y axis for keyboard movement (default: false).
   */
  invertYAxis?: boolean;

  /**
   * Invert X axis for keyboard movement (default: false).
   */
  invertXAxis?: boolean;

  /**
   * When true, if conflicting keys are pressed (e.g., both A and D),
   * the last pressed key takes precedence instead of canceling out (default: false).
   */
  useLastActiveKey?: boolean;
}

const DEFAULT_OPTIONS: Required<CameraKeyboardControllerOptions> = {
  keysUp: ["w", "W", "ArrowUp"],
  keysDown: ["s", "S", "ArrowDown"],
  keysLeft: ["a", "A", "ArrowLeft"],
  keysRight: ["d", "D", "ArrowRight"],
  keyboardMoveSpeed: 100.0,
  shiftMultiplier: 2.0,
  ctrlMultiplier: 0.5,
  invertYAxis: false,
  invertXAxis: false,
  useLastActiveKey: false,
};

/**
 * Controller for camera movement via keyboard (WASD/Arrow keys).
 * Provides smooth, frame-rate independent movement with modifier key support.
 *
 * Priority: 10 (lowest - processes after zoom and pan)
 *
 * @example
 * ```typescript
 * const keyboardController = new CameraKeyboardController({
 *   keyboardMoveSpeed: 100,
 *   shiftMultiplier: 2.0,
 *   useLastActiveKey: true
 * });
 * rig.add(keyboardController);
 * ```
 */
export class CameraKeyboardController implements ICameraController {
  readonly id = "keyboard";
  readonly priority = 10;
  enabled = true;

  private _options: Required<CameraKeyboardControllerOptions>;
  private _rig: CameraRig | null = null;

  // Track last active key for each direction (for useLastActiveKey option)
  private _lastActiveTimeLeft: number = 0;
  private _lastActiveTimeRight: number = 0;
  private _lastActiveTimeUp: number = 0;
  private _lastActiveTimeDown: number = 0;

  // Track previously pressed keys to detect new key presses
  private _prevKeysDown: Set<string> = new Set();

  constructor(options: CameraKeyboardControllerOptions = {}) {
    this._options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get keyboard move speed.
   */
  get keyboardMoveSpeed(): number {
    return this._options.keyboardMoveSpeed;
  }

  /**
   * Set keyboard move speed.
   */
  set keyboardMoveSpeed(value: number) {
    this._options.keyboardMoveSpeed = value;
  }

  onAttach(rig: CameraRig): void {
    this._rig = rig;
  }

  onDetach(): void {
    this._rig = null;
    this._clearLastActiveKeys();
    this._prevKeysDown.clear();
  }

  update(dt: number, camera: Camera, input: CameraInputState): boolean {
    // Update last active key timestamps for newly pressed keys
    if (this._options.useLastActiveKey) {
      this._updateLastActiveKeys(input);
    }

    // Store current keys for next frame comparison
    this._prevKeysDown = new Set(input.keysDown);

    // Calculate movement direction
    let moveX = 0;
    let moveY = 0;

    if (this._options.useLastActiveKey) {
      // Use last active key for each direction
      const leftPressed = this._options.keysLeft.some((k) => this._isKeyPressed(k, input));
      const rightPressed = this._options.keysRight.some((k) => this._isKeyPressed(k, input));
      const upPressed = this._options.keysUp.some((k) => this._isKeyPressed(k, input));
      const downPressed = this._options.keysDown.some((k) => this._isKeyPressed(k, input));

      // For X axis: if both left and right are pressed, use the last one
      if (leftPressed && rightPressed) {
        if (this._lastActiveTimeRight > this._lastActiveTimeLeft) {
          moveX += 1; // Right was pressed last
        } else if (this._lastActiveTimeLeft > this._lastActiveTimeRight) {
          moveX -= 1; // Left was pressed last
        }
      } else {
        if (leftPressed) moveX -= 1;
        if (rightPressed) moveX += 1;
      }

      // For Y axis: if both up and down are pressed, use the last one
      if (upPressed && downPressed) {
        if (this._lastActiveTimeDown > this._lastActiveTimeUp) {
          moveY -= 1; // Down was pressed last
        } else if (this._lastActiveTimeUp > this._lastActiveTimeDown) {
          moveY += 1; // Up was pressed last
        }
      } else {
        if (upPressed) moveY += 1;
        if (downPressed) moveY -= 1;
      }
    } else {
      // Original behavior: conflicting keys cancel out
      if (this._options.keysLeft.some((k) => this._isKeyPressed(k, input))) {
        moveX -= 1;
      }
      if (this._options.keysRight.some((k) => this._isKeyPressed(k, input))) {
        moveX += 1;
      }
      if (this._options.keysUp.some((k) => this._isKeyPressed(k, input))) {
        moveY += 1;
      }
      if (this._options.keysDown.some((k) => this._isKeyPressed(k, input))) {
        moveY -= 1;
      }
    }

    // No movement
    if (moveX === 0 && moveY === 0) {
      return false;
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= length;
      moveY /= length;
    }

    // Calculate speed multiplier from modifiers
    let speedMultiplier = 1.0;
    if (input.modifiers.shift) {
      speedMultiplier = this._options.shiftMultiplier;
    } else if (input.modifiers.ctrl) {
      speedMultiplier = this._options.ctrlMultiplier;
    }

    // Calculate movement delta
    // keyboardMoveSpeed is in world units per second
    // Scale by dt for frame-rate independent movement
    const speed = this._options.keyboardMoveSpeed * speedMultiplier;
    const worldDeltaX = moveX * speed * dt;
    const worldDeltaY = moveY * speed * dt;

    // Apply axis inversion
    // For keyboard, X axis is inverted by default (opposite of invertXAxis option)
    // This makes right arrow move camera right (content left), which is more intuitive for keyboard
    const xSign = this._options.invertXAxis ? -1 : 1;
    const ySign = this._options.invertYAxis ? -1 : 1;

    // Move camera
    camera.move(xSign * worldDeltaX, ySign * worldDeltaY, 0);

    // Don't consume input - keyboard movement doesn't block other controllers
    return false;
  }

  /**
   * Check if a key is currently pressed (case-insensitive).
   */
  private _isKeyPressed(key: string, input: CameraInputState): boolean {
    const keyLower = key.toLowerCase();
    return Array.from(input.keysDown).some((pressedKey) => pressedKey.toLowerCase() === keyLower);
  }

  /**
   * Update last active key timestamps for newly pressed keys.
   */
  private _updateLastActiveKeys(input: CameraInputState): void {
    const now = performance.now();

    for (const key of input.keysDown) {
      // Check if this is a newly pressed key
      const wasPressed = Array.from(this._prevKeysDown).some((k) => k.toLowerCase() === key.toLowerCase());
      if (wasPressed) continue;

      // Update timestamp for the appropriate direction
      if (this._options.keysLeft.some((k) => k.toLowerCase() === key.toLowerCase())) {
        this._lastActiveTimeLeft = now;
      }
      if (this._options.keysRight.some((k) => k.toLowerCase() === key.toLowerCase())) {
        this._lastActiveTimeRight = now;
      }
      if (this._options.keysUp.some((k) => k.toLowerCase() === key.toLowerCase())) {
        this._lastActiveTimeUp = now;
      }
      if (this._options.keysDown.some((k) => k.toLowerCase() === key.toLowerCase())) {
        this._lastActiveTimeDown = now;
      }
    }

    // Clear timestamps for released keys
    const leftPressed = this._options.keysLeft.some((k) => this._isKeyPressed(k, input));
    const rightPressed = this._options.keysRight.some((k) => this._isKeyPressed(k, input));
    const upPressed = this._options.keysUp.some((k) => this._isKeyPressed(k, input));
    const downPressed = this._options.keysDown.some((k) => this._isKeyPressed(k, input));

    if (!leftPressed) this._lastActiveTimeLeft = 0;
    if (!rightPressed) this._lastActiveTimeRight = 0;
    if (!upPressed) this._lastActiveTimeUp = 0;
    if (!downPressed) this._lastActiveTimeDown = 0;
  }

  /**
   * Clear all last active key timestamps.
   */
  private _clearLastActiveKeys(): void {
    this._lastActiveTimeLeft = 0;
    this._lastActiveTimeRight = 0;
    this._lastActiveTimeUp = 0;
    this._lastActiveTimeDown = 0;
  }
}
