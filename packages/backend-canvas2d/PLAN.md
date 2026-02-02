# `@arcanvas/backend-canvas2d` — Optional Minimal Preview Backend

## Purpose

`@arcanvas/backend-canvas2d` is an **optional** fallback intended for previews/debug overlays/editor UI, not full GPU parity.

In most cases, it should **not** pretend to be a complete `@arcanvas/rhi` implementation unless it can match semantics closely. If it can’t, prefer a separate interface (e.g. `Canvas2DDevice`) rather than a misleading full-RHI device.

## Responsibilities

- Provide a `PresentSurface` bound to a 2D canvas context.
- Implement:
  - either a minimal subset of `RhiDevice` (only what your UI preview needs), **or**
  - a separate “Canvas2D device” interface consumed by preview-only code paths.
- Keep limitations explicit (no hidden feature gaps).

## Folder plan

```
packages/backend-canvas2d/
  src/
    index.ts
    canvas2dBackend.ts
    canvas2dSurface.ts
    canvas2dDevice.ts
```
