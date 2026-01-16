# Functions

- [createRenderer](#createrenderer)

## createRenderer

Creates a renderer instance for the specified backend.

| Function | Type |
| ---------- | ---------- |
| `createRenderer` | `(canvas: HTMLCanvasElement, backend: Backend, options?: Partial<RendererOptions>) => IRenderer` |

Parameters:

* `canvas`: The canvas element to render to.
* `backend`: The rendering backend to use.
* `options`: Optional renderer configuration options.


Returns:

A renderer instance implementing IRenderer.

Examples:

```ts
const renderer = createRenderer(canvas, "webgl");
renderer.onDraw((ctx) => {
  mesh.render(ctx);
});
renderer.start();
```




# Types

- [Backend](#backend)

## Backend

Supported rendering backends.

| Type | Type |
| ---------- | ---------- |
| `Backend` | `webgl" or "canvas2d" or "webgpu` |

