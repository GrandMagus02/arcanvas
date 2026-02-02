# `@arcanvas/gpu` — Convenience Facade (Apps Import This)

## Purpose

`@arcanvas/gpu` is the **app-facing entry point** for the RHI stack:

- selects a backend (WebGPU-first, WebGL2 fallback)
- creates a `RhiDevice` + `PresentSurface`
- exposes an ergonomic `GpuContext` wrapper to manage frames, resize, dispose

It should stay focused on **bootstrapping + shared GPU utilities**, not higher-level rendering or editor logic.

## Responsibilities

- `createGpuContext(canvas, opts)` convenience API
- `GpuContext` lifecycle:
  - `beginFrame()` → allocate/return a frame object (encoder + per-frame helpers)
  - `endFrame(frame)` → submit + present
  - `resize()`
  - `dispose()`
- Optional shared utilities:
  - pipeline/bind-group caches (descriptor-keyed)
  - transient resource pools (texture/buffer) for render graphs
  - debug labels/marker scopes

## Proposed public API shape

```ts
type CreateGpuContextOptions = {
  prefer?: string[]; // e.g. ["webgpu", "webgl2"]
  requiredCaps?: unknown;
  qualityProfile?: "portable" | "balanced" | "native";
  diagnostics?: unknown;
};

interface GpuContext {
  device: RhiDevice;
  surface: PresentSurface;
  beginFrame(): unknown;
  endFrame(frame: unknown): void;
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}
```

Optional re-export pattern (to reduce import churn):

- re-export key types from `@arcanvas/rhi`

## Folder plan

```
packages/gpu/
  src/
    index.ts
    context/
      createGpuContext.ts
      gpuContext.ts
      frame.ts
    cache/
      pipelineCache.ts
      bindGroupCache.ts
    memory/
      texturePool.ts
      bufferPool.ts
    debug/
      labels.ts
      markers.ts
```

## Notes

- `@arcanvas/gpu` should use `@arcanvas/backend` for selection + surface lifecycle.
- Default-backend registration can be:
  - explicit: `registerDefaultBackends()`
  - or opt-in side-effect import: `import "@arcanvas/gpu/register-default-backends"`
