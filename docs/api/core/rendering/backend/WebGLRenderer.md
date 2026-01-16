# WebGLRenderer

WebGL-based renderer implementation.
Implements IRenderer interface and works with abstract IRenderContext in its public API.

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

Registers a draw hook that will be called each frame.

| Method | Type |
| ---------- | ---------- |
| `onDraw` | `(fn: DrawHook) => () => void` |

### setClearColor

Sets the clear color for the color buffer.

| Method | Type |
| ---------- | ---------- |
| `setClearColor` | `(r: number, g: number, b: number, a: number) => void` |

### setDepthTest

Enables or disables depth testing.

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

Starts the render loop.

| Method | Type |
| ---------- | ---------- |
| `start` | `() => void` |

### stop

Stops the render loop.

| Method | Type |
| ---------- | ---------- |
| `stop` | `() => void` |

### renderOnce

Render a single frame immediately.

| Method | Type |
| ---------- | ---------- |
| `renderOnce` | `() => void` |
