# Renderer

A class that can be used to render a scene.

## Methods

- [onDraw](#ondraw)
- [setClearColor](#setclearcolor)
- [setDepthTest](#setdepthtest)
- [setScissor](#setscissor)
- [clearScissor](#clearscissor)
- [start](#start)
- [stop](#stop)
- [renderOnce](#renderonce)

### onDraw

| Method | Type |
| ---------- | ---------- |
| `onDraw` | `(fn: DrawHook) => () => void` |

### setClearColor

| Method | Type |
| ---------- | ---------- |
| `setClearColor` | `(r: number, g: number, b: number, a: number) => void` |

### setDepthTest

| Method | Type |
| ---------- | ---------- |
| `setDepthTest` | `(enabled: boolean) => void` |

### setScissor

Sets an optional scissor rectangle in pixels; null disables scissor.

| Method | Type |
| ---------- | ---------- |
| `setScissor` | `(x: number, y: number, w: number, h: number) => void` |

### clearScissor

Clears the scissor rectangle.

| Method | Type |
| ---------- | ---------- |
| `clearScissor` | `() => void` |

### start

| Method | Type |
| ---------- | ---------- |
| `start` | `() => void` |

### stop

| Method | Type |
| ---------- | ---------- |
| `stop` | `() => void` |

### renderOnce

Render a single frame immediately.

| Method | Type |
| ---------- | ---------- |
| `renderOnce` | `() => void` |

# Interfaces

- [RendererOptions](#rendereroptions)

## RendererOptions

Options for configuring a renderer.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `clearColor` | `[number, number, number, number]` |  |
| `depthTest` | `boolean` |  |


# Types

- [DrawHook](#drawhook)

## DrawHook

A function that can be used to draw a scene.

| Type | Type |
| ---------- | ---------- |
| `DrawHook` | `(gl: WebGLRenderingContext, program: WebGLProgram) => void` |

