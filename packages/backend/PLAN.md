# `@arcanvas/backend` — Registry + Device/Surface Lifecycle

## Purpose

`@arcanvas/backend` is the **strategy/factory layer** for RHI backends. It answers:

- What backends are available?
- Which backend should we select (preference + requirements + scoring)?
- How do we create a `RhiDevice` and a `PresentSurface`?
- How do we manage surface resize/DPR/context loss in a backend-agnostic way?

## Responsibilities

- **Backend plugin registry**:
  - `registerBackend(factory)`
  - `unregisterBackend(id)` (optional)
  - `listBackends()`
- **Selection**:
  - choose backend by `prefer` order, `requiredCaps`, scoring, fallback policy
  - diagnostics hooks (`onBackendSelected`, `onDeviceLost`, …)
- **Surface abstraction**:
  - `PresentSurface` interface (configure, acquire current texture, present, resize, dispose)
  - common canvas sizing/DPR helpers (no backend-specific WebGPU/WebGL types leaking outward)
- **Policy**:
  - quality profiles (`portable | balanced | native`)
  - “requirements checking” helpers

## Proposed public API shape

### Backend factory types

```ts
interface BackendFactory {
  id: string;
  /** Quick/cheap support check (may probe environment). */
  isSupported(env?: unknown): Promise<boolean>;
  /** Optional scoring hook for selection strategy. */
  getScore?(env: unknown, opts: unknown): Promise<number>;
  /** Creates the RHI device. */
  createDevice(opts: unknown): Promise<RhiDevice>;
  /** Creates a presentable surface for a canvas-like target. */
  createSurface(target: unknown, opts: unknown): PresentSurface;
}
```

### Surface

```ts
interface PresentSurface {
  configure(device: RhiDevice, opts?: unknown): void;
  getCurrentTexture(): RhiTexture;
  present(): void;
  resize(width: number, height: number, dpr: number): void;
  dispose(): void;
}
```

### Selection

```ts
createContext({
  prefer: ["webgpu", "webgl2"],
  requiredCaps,
  qualityProfile,
  diagnostics,
}) => Promise<{ device: RhiDevice; surface: PresentSurface; backendId: string }>
```

## Folder plan

```
packages/backend/
  src/
    index.ts
    registry/
      backendRegistry.ts
      selection.ts
    surface/
      surface.ts
      canvasSurface.ts
    policy/
      qualityProfile.ts
      requirements.ts
    diagnostics/
      diagnostics.ts
```

## Notes

- Selection should be **scored**, not just “first supported”.
- Backends may “down-rank” themselves in certain environments (stability/feature gaps).
