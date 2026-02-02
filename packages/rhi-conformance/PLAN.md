# `@arcanvas/rhi-conformance` — Optional Cross-Backend Test Harness

## Purpose

`@arcanvas/rhi-conformance` is an **optional but strongly recommended** test suite to ensure:

- pipelines/bindings behave consistently across backends
- blending is correct (within tolerance)
- caps/format reporting is accurate
- render pass semantics match expectations

## Responsibilities

- Provide a suite of small “known scenes” rendered into a texture:
  - `triangle`
  - `srgbBlend`
  - `renderToTexture`
  - `mipSampling`
- Provide a harness to run tests on a selected backend.
- Compare output to references (hash/tolerance-based image compare).

## Folder plan

```
packages/rhi-conformance/
  src/
    index.ts
    tests/
      triangle.ts
      srgbBlend.ts
      renderToTexture.ts
      mipSampling.ts
    harness/
      runOnBackend.ts
      imageCompare.ts
```
