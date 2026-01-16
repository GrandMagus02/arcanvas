
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
Works with abstract IRenderContext, allowing the same draw code to work with different backends.

| Type | Type |
| ---------- | ---------- |
| `DrawHook` | `(renderContext: IRenderContext) => void` |

