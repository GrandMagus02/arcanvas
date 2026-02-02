# ControllerDevice

Controller/gamepad-specific device utilities with deadzone support.

## Methods

- [getAxis](#getaxis)
- [isButtonPressed](#isbuttonpressed)
- [getPressedButtons](#getpressedbuttons)
- [getRawAxis](#getrawaxis)
- [setDeadzone](#setdeadzone)
- [getDeadzone](#getdeadzone)

### getAxis

Gets normalized axis value with deadzone and saturation applied.

| Method | Type |
| ---------- | ---------- |
| `getAxis` | `(event: NormalizedInputEvent, axis: ControllerAxis) => number` |

### isButtonPressed

Checks if a button is pressed.

| Method | Type |
| ---------- | ---------- |
| `isButtonPressed` | `(event: NormalizedInputEvent, button: ControllerButton) => boolean` |

### getPressedButtons

Gets all pressed buttons.

| Method | Type |
| ---------- | ---------- |
| `getPressedButtons` | `(event: NormalizedInputEvent) => ControllerButton[]` |

### getRawAxis

Gets raw axis value without deadzone/saturation.

| Method | Type |
| ---------- | ---------- |
| `getRawAxis` | `(event: NormalizedInputEvent, axis: ControllerAxis) => number` |

### setDeadzone

Updates deadzone configuration.

| Method | Type |
| ---------- | ---------- |
| `setDeadzone` | `(axis: ControllerAxis, value: number) => void` |

### getDeadzone

Gets deadzone configuration.

| Method | Type |
| ---------- | ---------- |
| `getDeadzone` | `(axis: ControllerAxis) => number` |

# Enum

- [ControllerButton](#controllerbutton)
- [ControllerAxis](#controlleraxis)

## ControllerButton

Named controller buttons.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `A` | `"A"` |  |
| `B` | `"B"` |  |
| `X` | `"X"` |  |
| `Y` | `"Y"` |  |
| `LB` | `"LB"` |  |
| `RB` | `"RB"` |  |
| `LT` | `"LT"` |  |
| `RT` | `"RT"` |  |
| `Back` | `"Back"` |  |
| `Start` | `"Start"` |  |
| `LeftStick` | `"LeftStick"` |  |
| `RightStick` | `"RightStick"` |  |
| `DPadUp` | `"DPadUp"` |  |
| `DPadDown` | `"DPadDown"` |  |
| `DPadLeft` | `"DPadLeft"` |  |
| `DPadRight` | `"DPadRight"` |  |


## ControllerAxis

Named controller axes.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `LeftStickX` | `"leftStickX"` |  |
| `LeftStickY` | `"leftStickY"` |  |
| `RightStickX` | `"rightStickX"` |  |
| `RightStickY` | `"rightStickY"` |  |
| `LeftTrigger` | `"leftTrigger"` |  |
| `RightTrigger` | `"rightTrigger"` |  |


# Interfaces

- [ControllerDeadzones](#controllerdeadzones)
- [ControllerDeviceOptions](#controllerdeviceoptions)

## ControllerDeadzones

Deadzone configuration for controller axes.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `leftStickX` | `number or undefined` |  |
| `leftStickY` | `number or undefined` |  |
| `rightStickX` | `number or undefined` |  |
| `rightStickY` | `number or undefined` |  |
| `leftTrigger` | `number or undefined` |  |
| `rightTrigger` | `number or undefined` |  |


## ControllerDeviceOptions

Options for ControllerDevice.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `deadzones` | `ControllerDeadzones or undefined` |  |
| `saturation` | `Record<string, (value: number) => number> or undefined` |  |

