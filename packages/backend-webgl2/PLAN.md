# `@arcanvas/backend-webgl2` — WebGL2 Backend Plugin (RHI Emulation)

## Purpose

`@arcanvas/backend-webgl2` implements the `@arcanvas/rhi` contracts on top of **WebGL2** by emulating WebGPU-style concepts (pipelines, bind groups, passes).

This is the most delicate backend: it must be predictable while minimizing state churn via aggressive caching.

## Responsibilities

- `isSupported()`:
  - check WebGL2 availability (`canvas.getContext("webgl2")`)
  - check required extensions / limits / precision
- Create a `RhiDevice` backed by `WebGL2RenderingContext`
- Provide `PresentSurface` semantics:
  - “current texture” maps to default framebuffer (or a wrapper)
  - `present()` is typically a no-op (implicit swap)
- Translate:
  - `RenderPipeline` → linked program + fixed state bundle
  - `BindGroup` → cached uniform/UBO updates + texture-unit bindings
  - `RenderPass` → FBO binding + clears + draw calls
- Maintain:
  - **state cache** (bound program/buffers/textures)
  - format/feature mapping tables (`RHI format` ↔ `GL internal format`)
  - explicit caps/limits reporting (compute likely unsupported)

## Folder plan

```
packages/backend-webgl2/
  src/
    index.ts
    webgl2/
      webgl2Backend.ts
      webgl2Device.ts
      webgl2Surface.ts
      state/
        stateCache.ts
        textureUnitAllocator.ts
      resources/
        buffer.ts
        texture.ts
        sampler.ts
        framebuffer.ts
      pipeline/
        glslCompiler.ts
        program.ts
        pipeline.ts
        uniformLayout.ts
      command/
        commandEncoder.ts
        renderPass.ts
      caps/
        detectCaps.ts
      compat/
        formatMapping.ts
        featureEmulation.ts
```

## Notes

- Prefer GLSL ES 3.00 sources for this backend.
- Make limitations explicit via `DeviceCaps` (supported formats, texture units, float targets, etc.).
