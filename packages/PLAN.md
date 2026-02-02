# Backend Rendering Module Plan (RHI + Pluggable Backends)

This document captures the **backend-rendering-focused** package layout for a future **backend-agnostic GPU layer** (RHI), with **pluggable backends** (WebGPU-first, WebGL2 fallback).

It is intentionally **separate** from the current `@arcanvas/graphics` + `@arcanvas/backend-webgl` stack (which implements `IRenderBackend`). These new packages define a _new_ “RHI-style” API that can be adopted incrementally.

## Goals

- **Backend-agnostic render core** (RHI vocabulary: pipelines, bind groups, encoders, passes)
- **Pluggable backends** (WebGPU, WebGL2, future backends as plugins)
- **One “easy entry” package** for apps: `@arcanvas/gpu`
- **Clean dependency boundaries** so backend details do not leak upward

## Dependency rules (hard)

- `@arcanvas/rhi` depends on **nothing** (or only “foundation” types).
- `@arcanvas/backend` depends on `@arcanvas/rhi`.
- `@arcanvas/backend-*` depend on `@arcanvas/rhi` + `@arcanvas/backend`.
- `@arcanvas/gpu` depends on `@arcanvas/rhi` + `@arcanvas/backend`.
- No runtime/core/editor packages import `@arcanvas/backend-*` directly; they import `@arcanvas/gpu` or accept an injected `RhiDevice`.

## Packages

- **`@arcanvas/rhi`**
  - **Contract only**: interfaces, enums, descriptors, caps/limits, error model.
  - No DOM / `navigator.gpu` / WebGL types.

- **`@arcanvas/backend`**
  - Backend **registry + selection** (preference order + scoring + required caps).
  - `PresentSurface` abstraction and canvas/surface lifecycle helpers.

- **`@arcanvas/gpu`**
  - App-facing convenience facade: `createGpuContext(canvas, opts)`.
  - Re-exports common RHI types (optional) to reduce import churn.
  - Optional: default backend auto-registration.

- **`@arcanvas/backend-webgpu`**
  - WebGPU implementation plugin (`BackendFactory`).
  - WGSL-first shader path; maps RHI descriptors → WebGPU descriptors.

- **`@arcanvas/backend-webgl2`**
  - WebGL2 fallback plugin, providing an **RHI emulation layer** on top of WebGL2.
  - Aggressive caching + state tracking; GLSL ES 3.00 shader path.

## Optional packages

- **`@arcanvas/backend-canvas2d`**
  - Very limited fallback (UI preview / debug); recommended to keep **separate** from full RHI unless it can fully match semantics.

- **`@arcanvas/rhi-conformance`**
  - Cross-backend test harness to validate consistency (triangle, blend, RTT, sampling, etc.).

## How it fits the existing repo

- Existing: `@arcanvas/graphics` defines `IRenderBackend` (current WebGL2 backend is `@arcanvas/backend-webgl`).
- New: `@arcanvas/rhi` defines **RHI** contracts for a future GPU abstraction layer.
- Adoption path:
  - Start by implementing `@arcanvas/backend-webgpu` + `@arcanvas/backend-webgl2` behind `@arcanvas/gpu`.
  - Add higher-level render systems/kernels on top of `RhiDevice`, without coupling them to WebGPU/WebGL directly.
