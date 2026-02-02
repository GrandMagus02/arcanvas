# `@arcanvas/rhi` — Contract (Backend-Agnostic GPU API)

## Purpose

`@arcanvas/rhi` defines a **small explicit GPU API** (interfaces + types) that backends implement and higher-level render/kernels compile against. It is **not** a renderer—just the GPU vocabulary.

## Responsibilities

- **Interfaces (opaque handles)**:
  - `RhiDevice`, `RhiQueue`
  - `RhiBuffer`, `RhiTexture`, `RhiSampler`
  - `RhiShaderModule`
  - `RhiBindGroupLayout`, `RhiBindGroup`
  - `RhiRenderPipeline`, `RhiComputePipeline`
  - `RhiCommandEncoder`, `RhiRenderPassEncoder`, `RhiComputePassEncoder`
- **Descriptors / enums**:
  - formats, usages, states (blend, depth-stencil, vertex layouts)
- **Capabilities**:
  - `DeviceCaps`, `DeviceLimits`, format support tables
- **Diagnostics contract**:
  - labels on all objects, error/validation types, optional debug markers (no-op when unsupported)

## Hard rules

- **No DOM**: no `HTMLCanvasElement`, `navigator.gpu`, `WebGL*` types.
- **No runtime backend logic**: only contracts, plus tiny pure helpers.
- Keep API **explicit** (WebGPU-style): avoid GL-like implicit state setters.

## Shader source model

```ts
type ShaderSource = { kind: "wgsl"; code: string } | { kind: "glsl"; stage: "vertex" | "fragment"; code: string } | { kind: "spirv"; bytes: Uint32Array };
```

Backends decide what they accept; the kernel layer decides which sources to provide.

## Suggested public API surface

- **Core**: `RhiDevice`, `RhiQueue`
- **Resources**: `BufferDesc`, `TextureDesc`, `SamplerDesc`, usage/format enums
- **Binding**: `BindGroupLayoutDesc`, `BindGroupDesc`
- **Pipelines**: `RenderPipelineDesc`, `ComputePipelineDesc`, `VertexLayoutDesc`, blend/depth state models
- **Commands**: `CommandEncoderDesc`, `RenderPassDesc`, `ComputePassDesc`
- **Caps**: `DeviceCaps`, `DeviceLimits`, `Feature`, `FormatCaps`
- **Errors**: `RhiError`, `RhiValidationIssue`

## Folder plan

```
packages/rhi/
  src/
    index.ts
    types/
      caps.ts
      limits.ts
      formats.ts
      errors.ts
    resource/
      buffer.ts
      texture.ts
      sampler.ts
    pipeline/
      bindGroup.ts
      shader.ts
      renderPipeline.ts
      computePipeline.ts
    command/
      encoder.ts
      renderPass.ts
      computePass.ts
    util/
      hash.ts
      label.ts
```

## Notes

- Provide stable descriptor hashing helpers in `util/hash.ts` (pure) to support pipeline/bindgroup caches in higher layers.
