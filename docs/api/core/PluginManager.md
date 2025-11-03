# PluginManager

The plugin manager.

## Methods

- [has](#has)
- [get](#get)
- [use](#use)
- [destroy](#destroy)
- [setupAll](#setupall)
- [destroyAll](#destroyall)

### has

| Method | Type |
| ---------- | ---------- |
| `has` | `<T = unknown>(plugin: PluginLike<T>) => boolean` |

### get

| Method | Type |
| ---------- | ---------- |
| `get` | `<T = unknown>(plugin: PluginLike<T>) => T or undefined` |

### use

| Method | Type |
| ---------- | ---------- |
| `use` | `<T = unknown>(plugin: PluginLike<T>, opts: T) => void` |

### destroy

| Method | Type |
| ---------- | ---------- |
| `destroy` | `<T = unknown>(plugin: PluginLike<T>) => void` |

### setupAll

| Method | Type |
| ---------- | ---------- |
| `setupAll` | `() => void` |

### destroyAll

| Method | Type |
| ---------- | ---------- |
| `destroyAll` | `() => void` |
