# RenderSystem

Wrapper around IRenderer that connects rendering backend with the scene stage.

## Methods

- [start](#start)
- [stop](#stop)
- [renderOnce](#renderonce)

### start

| Method | Type |
| ---------- | ---------- |
| `start` | `() => void` |

### stop

| Method | Type |
| ---------- | ---------- |
| `stop` | `() => void` |

### renderOnce

| Method | Type |
| ---------- | ---------- |
| `renderOnce` | `() => void` |

# Interfaces

- [RenderSystemOptions](#rendersystemoptions)

## RenderSystemOptions

Options for configuring a render system.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `backend` | `Backend` |  |
| `rendererOptions` | `Partial<RendererOptions> or undefined` |  |

