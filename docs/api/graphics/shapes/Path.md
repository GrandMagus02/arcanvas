# Functions

- [parseSVGPath](#parsesvgpath)

## parseSVGPath

| Function | Type |
| ---------- | ---------- |
| `parseSVGPath` | `(d: string) => PathCommand[]` |


# Path

# Interfaces

- [PathOptions](#pathoptions)

## PathOptions



| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `fill` | `boolean or undefined` |  |
| `stroke` | `boolean or undefined` |  |
| `strokeWidth` | `number or undefined` |  |
| `tolerance` | `number or undefined` | Tessellation tolerance in world units. Lower values result in smoother curves but more vertices. Default: 0.15 |
| `resolution` | `number or undefined` |  deprecated: Use tolerance instead for adaptive tessellation. |


# Types

- [PathCommand](#pathcommand)

## PathCommand

| Type | Type |
| ---------- | ---------- |
| `PathCommand` | `| { type: "M"; x: number; y: number } // Move to or { type: "L"; x: number; y: number } // Line to or { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number } // Cubic bezier or { type: "Q"; x1: number; y1: number; x: number; y: number } // Quadratic bezier or { type: "Z" }` |

