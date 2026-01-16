# Arcanvas

Arcanvas is a facade class that coordinates multiple subsystems:
- CanvasHost: DOM canvas, dimensions, DPR, focus
- EventSystem: Event bus wrapper
- SceneSystem: Stage and cameras
- RenderSystem: Rendering backend and connection to stage
- PluginSystem: Plugin management

Implements multiple interfaces for event handling, configuration, lifecycle management, plugin hosting, and focus management.

## Methods

- [setCamera](#setcamera)
- [on](#on)
- [once](#once)
- [off](#off)
- [emit](#emit)
- [getOptions](#getoptions)
- [updateOptions](#updateoptions)
- [setOptions](#setoptions)
- [resetOptions](#resetoptions)
- [use](#use)
- [has](#has)
- [get](#get)
- [start](#start)
- [stop](#stop)
- [destroy](#destroy)
- [isFocused](#isfocused)
- [resize](#resize)

### setCamera

Sets the active camera.

| Method | Type |
| ---------- | ---------- |
| `setCamera` | `(camera: string or Camera or null) => void` |

### on

Subscribe to an event.

| Method | Type |
| ---------- | ---------- |
| `on` | `<K extends keyof ArcanvasEvents>(event: K, fn: (...args: ArcanvasEvents[K]) => void) => () => void` |

### once

Subscribe to an event once.

| Method | Type |
| ---------- | ---------- |
| `once` | `<K extends keyof ArcanvasEvents>(event: K, fn: (...args: ArcanvasEvents[K]) => void) => () => void` |

### off

Unsubscribe from an event.

| Method | Type |
| ---------- | ---------- |
| `off` | `<K extends keyof ArcanvasEvents>(event: K, fn: (...args: ArcanvasEvents[K]) => void) => void` |

### emit

Emit an event.

| Method | Type |
| ---------- | ---------- |
| `emit` | `<K extends keyof ArcanvasEvents>(event: K, ...args: ArcanvasEvents[K]) => void` |

### getOptions

Gets the current options.

| Method | Type |
| ---------- | ---------- |
| `getOptions` | `() => ArcanvasOptions` |

### updateOptions

Updates options with partial values.

| Method | Type |
| ---------- | ---------- |
| `updateOptions` | `(options: Partial<ArcanvasOptions>) => void` |

### setOptions

Sets all options to the provided values.

| Method | Type |
| ---------- | ---------- |
| `setOptions` | `(options: ArcanvasOptions) => void` |

### resetOptions

Resets options to default values.

| Method | Type |
| ---------- | ---------- |
| `resetOptions` | `() => void` |

### use

Registers a plugin with optional options.

| Method | Type |
| ---------- | ---------- |
| `use` | `<T = unknown>(plugin: PluginLike<T>, opts?: T or undefined) => Arcanvas` |

### has

Checks if a plugin is registered.

| Method | Type |
| ---------- | ---------- |
| `has` | `(plugin: PluginLike) => boolean` |

### get

Gets the instance of a registered plugin.

| Method | Type |
| ---------- | ---------- |
| `get` | `<T = unknown>(plugin: PluginLike<T>) => T or undefined` |

### start

Starts the object's lifecycle (e.g., begins rendering loop).

| Method | Type |
| ---------- | ---------- |
| `start` | `() => void` |

### stop

Stops the object's lifecycle (e.g., stops rendering loop).

| Method | Type |
| ---------- | ---------- |
| `stop` | `() => void` |

### destroy

Destroys the object and cleans up all resources.

| Method | Type |
| ---------- | ---------- |
| `destroy` | `() => void` |

### isFocused

Checks if the object currently has focus.

| Method | Type |
| ---------- | ---------- |
| `isFocused` | `() => boolean` |

### resize

Resize the canvas (in device pixels) and render a frame immediately.

| Method | Type |
| ---------- | ---------- |
| `resize` | `(width: number, height: number) => void` |

Parameters:

* `width`: - The width of the canvas in device pixels.
* `height`: - The height of the canvas in device pixels.


# Interfaces

- [ArcanvasOptions](#arcanvasoptions)

## ArcanvasOptions

Options for configuring an `Arcanvas` instance.

| Property | Type | Description |
| ---------- | ---------- | ---------- |
| `backend` | `Backend or undefined` | Rendering backend to use. Defaults to "webgl". |
| `rendererOptions` | `Partial<RendererOptions> or undefined` | Options for the renderer (clear color, depth test, etc.). |

