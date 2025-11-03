# Functions

- [composeToCanvas](#composetocanvas)

## composeToCanvas

Flattens a layer tree to a target 2D canvas using Canvas2D blend modes.

| Function | Type |
| ---------- | ---------- |
| `composeToCanvas` | `(target: HTMLCanvasElement, root: GroupLayer, opts?: ComposeOptions) => void` |



# Interfaces

- [ComposeOptions](#composeoptions)

## ComposeOptions

Options for composing a document to a canvas.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `clearBefore` | `boolean or undefined` |  |
| `background` | `{ r: number; g: number; b: number; a: number; } or null or undefined` |  |
| `dirtyRect` | `DOMRectReadOnly or null or undefined` |  |

