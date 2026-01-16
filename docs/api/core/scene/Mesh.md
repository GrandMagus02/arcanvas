# Mesh

Base class for all mesh objects that can be rendered.

## Methods

- [render](#render)

### render

Renders this mesh using the provided render context.
Sets up vertex and index buffers. Subclasses should call this first,
then set up attributes/uniforms and call draw commands.

| Method | Type |
| ---------- | ---------- |
| `render` | `(ctx: IRenderContext) => void` |

Parameters:

* `ctx`: The render context to use for rendering.

