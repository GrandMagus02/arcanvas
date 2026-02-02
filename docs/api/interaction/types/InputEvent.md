
# Interfaces

- [InputPosition](#inputposition)
- [PenProperties](#penproperties)
- [TouchPoint](#touchpoint)
- [ControllerState](#controllerstate)
- [NormalizedInputEvent](#normalizedinputevent)

## InputPosition

Normalized position information from input events.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `x` | `number` |  |
| `y` | `number` |  |
| `clientX` | `number` |  |
| `clientY` | `number` |  |
| `offsetX` | `number` |  |
| `offsetY` | `number` |  |
| `pageX` | `number` |  |
| `pageY` | `number` |  |


## PenProperties

Pen-specific input properties.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `pressure` | `number` |  |
| `tiltX` | `number` |  |
| `tiltY` | `number` |  |
| `twist` | `number or undefined` |  |
| `isEraser` | `boolean` |  |
| `barrelButton` | `number or undefined` |  |


## TouchPoint

Touch point information.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `identifier` | `number` |  |
| `position` | `InputPosition` |  |
| `radiusX` | `number or undefined` |  |
| `radiusY` | `number or undefined` |  |
| `rotationAngle` | `number or undefined` |  |
| `force` | `number or undefined` |  |


## ControllerState

Controller button/axis information.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `buttons` | `Map<string, boolean>` |  |
| `axes` | `Map<string, number>` |  |


## NormalizedInputEvent

Normalized input event that abstracts away browser differences.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `type` | `InputEventType` |  |
| `device` | `InputDevice` |  |
| `timestamp` | `number` |  |
| `position` | `InputPosition` |  |
| `buttons` | `MouseButton[]` |  |
| `key` | `string or undefined` |  |
| `code` | `string or undefined` |  |
| `modifiers` | `ModifierKey[]` |  |
| `pointerType` | `PointerType or undefined` |  |
| `pen` | `PenProperties or undefined` |  |
| `touches` | `TouchPoint[] or undefined` |  |
| `controller` | `ControllerState or undefined` |  |
| `deltaX` | `number or undefined` |  |
| `deltaY` | `number or undefined` |  |
| `deltaZ` | `number or undefined` |  |
| `deltaMode` | `number or undefined` |  |
| `originalEvent` | `Event or undefined` |  |


# Types

- [InputEventType](#inputeventtype)

## InputEventType

Normalized input event type.

| Type | Type |
| ---------- | ---------- |
| `InputEventType` | `| "keydown" or "keyup" or "mousedown" or "mouseup" or "mousemove" or "mouseleave" or "pointerdown" or "pointerup" or "pointermove" or "pointerleave" or "pointercancel" or "touchstart" or "touchend" or "touchmove" or "touchcancel" or "wheel" or "contextmenu` |

