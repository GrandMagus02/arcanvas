# `@arcanvas/backend-webgpu` — WebGPU Backend Plugin

## Purpose

`@arcanvas/backend-webgpu` implements the `@arcanvas/rhi` contracts on top of **WebGPU** and exports a `BackendFactory` plugin (typically `id = "webgpu"`).

## Responsibilities

- `isSupported()`:
  - verify WebGPU availability (`navigator.gpu`)
  - request adapter/device as needed
  - check required features/limits for requested caps
- Create a `RhiDevice` backed by `GPUDevice`
- Create a `PresentSurface` backed by `GPUCanvasContext`
- Translate:
  - RHI descriptors → WebGPU descriptors (buffers/textures/samplers, pipelines, bind groups)
  - `ShaderSource` → `GPUShaderModule` (WGSL-first)
- Manage:
  - device lost + error scopes
  - caps/format tables
  - strict validation (recommended)

## Folder plan

```
packages/backend-webgpu/
  src/
    index.ts
    webgpu/
      webgpuBackend.ts
      webgpuDevice.ts
      webgpuQueue.ts
      webgpuSurface.ts
      webgpuResources/
        buffer.ts
        texture.ts
        sampler.ts
      webgpuPipeline/
        shaderModule.ts
        bindGroup.ts
        pipeline.ts
      webgpuCommand/
        commandEncoder.ts
        renderPass.ts
        computePass.ts
      caps/
        detectCaps.ts
```

## Notes

- Prefer WGSL as the primary shader format.
- If WebGPU is available but unstable on certain environments, expose that via selection scoring (`getScore`) rather than hard-failing `isSupported()`.
