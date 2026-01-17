import type { NormalizedInputEvent } from "../types/InputEvent";

/**
 * Named controller buttons.
 */
export enum ControllerButton {
  A = "A",
  B = "B",
  X = "X",
  Y = "Y",
  LB = "LB", // Left Bumper
  RB = "RB", // Right Bumper
  LT = "LT", // Left Trigger
  RT = "RT", // Right Trigger
  Back = "Back",
  Start = "Start",
  LeftStick = "LeftStick",
  RightStick = "RightStick",
  DPadUp = "DPadUp",
  DPadDown = "DPadDown",
  DPadLeft = "DPadLeft",
  DPadRight = "DPadRight",
}

/**
 * Named controller axes.
 */
export enum ControllerAxis {
  LeftStickX = "leftStickX",
  LeftStickY = "leftStickY",
  RightStickX = "rightStickX",
  RightStickY = "rightStickY",
  LeftTrigger = "leftTrigger",
  RightTrigger = "rightTrigger",
}

/**
 * Deadzone configuration for controller axes.
 */
export interface ControllerDeadzones {
  leftStickX?: number;
  leftStickY?: number;
  rightStickX?: number;
  rightStickY?: number;
  leftTrigger?: number;
  rightTrigger?: number;
}

/**
 * Options for ControllerDevice.
 */
export interface ControllerDeviceOptions {
  deadzones?: ControllerDeadzones;
  saturation?: Record<string, (value: number) => number>; // Optional saturation curves
}

/**
 * Controller/gamepad-specific device utilities with deadzone support.
 */
export class ControllerDevice {
  private _deadzones: Required<ControllerDeadzones>;
  private _saturation?: Record<string, (value: number) => number>;

  constructor(options: ControllerDeviceOptions = {}) {
    this._deadzones = {
      leftStickX: options.deadzones?.leftStickX ?? 0.1,
      leftStickY: options.deadzones?.leftStickY ?? 0.1,
      rightStickX: options.deadzones?.rightStickX ?? 0.15,
      rightStickY: options.deadzones?.rightStickY ?? 0.15,
      leftTrigger: options.deadzones?.leftTrigger ?? 0.05,
      rightTrigger: options.deadzones?.rightTrigger ?? 0.05,
    };
    this._saturation = options.saturation;
  }

  /**
   * Applies deadzone to an axis value.
   */
  private _applyDeadzone(value: number, deadzone: number): number {
    if (Math.abs(value) < deadzone) {
      return 0;
    }
    // Scale from [deadzone, 1] to [0, 1]
    const sign = value < 0 ? -1 : 1;
    const absValue = Math.abs(value);
    const scaled = (absValue - deadzone) / (1 - deadzone);
    return sign * Math.min(scaled, 1);
  }

  /**
   * Applies saturation curve if configured.
   */
  private _applySaturation(value: number, axisName: string): number {
    if (this._saturation && this._saturation[axisName]) {
      return this._saturation[axisName](value);
    }
    return value;
  }

  /**
   * Gets normalized axis value with deadzone and saturation applied.
   */
  getAxis(event: NormalizedInputEvent, axis: ControllerAxis): number {
    if (!event.controller) return 0;
    const rawValue = event.controller.axes.get(axis) ?? 0;
    const deadzone = this._deadzones[axis as keyof ControllerDeadzones] ?? 0.1;
    const deadzoned = this._applyDeadzone(rawValue, deadzone);
    return this._applySaturation(deadzoned, axis);
  }

  /**
   * Checks if a button is pressed.
   */
  isButtonPressed(event: NormalizedInputEvent, button: ControllerButton): boolean {
    return event.controller?.buttons.get(button) ?? false;
  }

  /**
   * Gets all pressed buttons.
   */
  getPressedButtons(event: NormalizedInputEvent): ControllerButton[] {
    if (!event.controller) return [];
    const pressed: ControllerButton[] = [];
    for (const [button, isPressed] of event.controller.buttons) {
      if (isPressed) {
        pressed.push(button as ControllerButton);
      }
    }
    return pressed;
  }

  /**
   * Gets raw axis value without deadzone/saturation.
   */
  getRawAxis(event: NormalizedInputEvent, axis: ControllerAxis): number {
    return event.controller?.axes.get(axis) ?? 0;
  }

  /**
   * Updates deadzone configuration.
   */
  setDeadzone(axis: ControllerAxis, value: number): void {
    this._deadzones[axis as keyof ControllerDeadzones] = value;
  }

  /**
   * Gets deadzone configuration.
   */
  getDeadzone(axis: ControllerAxis): number {
    return this._deadzones[axis as keyof ControllerDeadzones] ?? 0.1;
  }
}
