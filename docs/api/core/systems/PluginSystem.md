# PluginSystem

Manages plugin lifecycle and registration.
Replaces PluginManager with better separation of concerns.

## Methods

- [use](#use)
- [has](#has)
- [get](#get)
- [destroy](#destroy)
- [setupAll](#setupall)
- [destroyAll](#destroyall)

### use

| Method | Type |
| ---------- | ---------- |
| `use` | `<T = unknown>(plugin: PluginLike<T>, opts?: T or undefined) => Host` |

### has

| Method | Type |
| ---------- | ---------- |
| `has` | `(plugin: PluginLike) => boolean` |

### get

| Method | Type |
| ---------- | ---------- |
| `get` | `<T = unknown>(plugin: PluginLike<T>) => T or undefined` |

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
