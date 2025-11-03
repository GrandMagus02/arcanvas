# Arcanvas

Arcanvas is a class that provides a canvas for rendering.

## Methods

- [getOptions](#getoptions)
- [updateOptions](#updateoptions)
- [setOptions](#setoptions)
- [resetOptions](#resetoptions)
- [use](#use)
- [destroy](#destroy)
- [has](#has)
- [get](#get)
- [start](#start)
- [stop](#stop)
- [resize](#resize)

### getOptions

| Method | Type |
| ---------- | ---------- |
| `getOptions` | `() => ArcanvasOptions` |

### updateOptions

| Method | Type |
| ---------- | ---------- |
| `updateOptions` | `(options: Partial<ArcanvasOptions>) => void` |

### setOptions

| Method | Type |
| ---------- | ---------- |
| `setOptions` | `(options: ArcanvasOptions) => void` |

### resetOptions

| Method | Type |
| ---------- | ---------- |
| `resetOptions` | `() => void` |

### use

| Method | Type |
| ---------- | ---------- |
| `use` | `<T = unknown>(plugin: PluginLike<T>, opts?: T or undefined) => Arcanvas` |

### destroy

| Method | Type |
| ---------- | ---------- |
| `destroy` | `() => void` |

### has

| Method | Type |
| ---------- | ---------- |
| `has` | `<T = unknown>(plugin: PluginLike<T>) => boolean` |

### get

| Method | Type |
| ---------- | ---------- |
| `get` | `<T = unknown>(plugin: PluginLike<T>) => T or undefined` |

### start

| Method | Type |
| ---------- | ---------- |
| `start` | `() => void` |

### stop

| Method | Type |
| ---------- | ---------- |
| `stop` | `() => void` |

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
| `width` | `number` |  |
| `height` | `number` |  |

