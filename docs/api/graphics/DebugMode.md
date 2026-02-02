# Functions

- [seededRandom](#seededrandom)
- [generateTriangleColor](#generatetrianglecolor)

## seededRandom

Simple seeded random number generator for consistent colors.

| Function | Type |
| ---------- | ---------- |
| `seededRandom` | `(seed: number) => () => number` |

## generateTriangleColor

Generates a random color with optional seed.
Colors are chosen to be visually distinct (avoiding very dark colors).

| Function | Type |
| ---------- | ---------- |
| `generateTriangleColor` | `(triangleIndex: number, seed?: number or undefined) => [number, number, number, number]` |


# Constants

- [DEFAULT_DEBUG_OPTIONS](#default_debug_options)

## DEFAULT_DEBUG_OPTIONS

Default debug options.

| Constant | Type |
| ---------- | ---------- |
| `DEFAULT_DEBUG_OPTIONS` | `DebugOptions` |



# Interfaces

- [DebugOptions](#debugoptions)

## DebugOptions

Options for debug rendering.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `mode` | `DebugMode` | The debug visualization mode. default: "none" |
| `opacity` | `number or undefined` | Opacity of the debug overlay (0-1). Only used when combining debug view with normal rendering. default: 1.0 |
| `colorSeed` | `number or undefined` | Seed for random color generation in triangle mode. Use the same seed for consistent colors across frames. default: undefined (random each frame) |
| `wireframeOverlay` | `boolean or undefined` | Whether to show wireframe on top of the debug visualization. default: false |


# Types

- [DebugMode](#debugmode)

## DebugMode

Debug visualization modes for rendering.
These modes help visualize mesh structure and rendering characteristics.

| Type | Type |
| ---------- | ---------- |
| `DebugMode` | `| "none" // Normal rendering or "triangles" // Each triangle with a unique random color or "wireframe" // Wireframe overlay or "normals" // Visualize vertex normals or "uv" // Visualize UV coordinates as colors or "depth` |

