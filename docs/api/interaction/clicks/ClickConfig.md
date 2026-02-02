
# Interfaces

- [ClickConfig](#clickconfig)
- [LongPressConfig](#longpressconfig)

## ClickConfig

Configuration for click detection.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `timeout` | `number or undefined` |  |
| `radius` | `number or undefined` |  |
| `onClick` | `((position: InputPosition, button: number) => void) or undefined` |  |
| `onDoubleClick` | `((position: InputPosition, button: number) => void) or undefined` |  |
| `onTripleClick` | `((position: InputPosition, button: number) => void) or undefined` |  |
| `onNClick` | `((count: number, position: InputPosition, button: number) => void) or undefined` |  |


## LongPressConfig

Configuration for long press detection.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `duration` | `number or undefined` |  |
| `tolerance` | `number or undefined` |  |
| `onStart` | `((position: InputPosition) => void) or undefined` |  |
| `onUpdate` | `((position: InputPosition, elapsed: number) => void) or undefined` |  |
| `onLongPress` | `((position: InputPosition, elapsed: number) => void) or undefined` |  |
| `onEnd` | `((position: InputPosition) => void) or undefined` |  |
| `onCancel` | `((reason: string) => void) or undefined` |  |

