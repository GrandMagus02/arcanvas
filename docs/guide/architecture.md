# Architecture

Arcanvas follows a Clean/Hexagonal architecture with Ports/Adapters pattern, designed for WebGPU-first development with WebGL2 backwards compatibility.

## Package Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                        Features                              │
│  typography, selection                                       │
├─────────────────────────────────────────────────────────────┤
│                     Scene / Runtime                          │
│  scene, runtime                                              │
├──────────────────────────┬──────────────────────────────────┤
│     Adapters             │                                   │
│  webgpu, webgl2         │                                   │
├──────────────────────────┴──────────────────────────────────┤
│                         Kernel                               │
│  gfx (ports/interfaces)                                      │
├─────────────────────────────────────────────────────────────┤
│                       Foundation                             │
│  math, color, interaction                                    │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Foundation (Zero Dependencies)

- **@arcanvas/math**: N-dimensional vectors (Vec2, Vec3, Vec4) and matrices (Mat2, Mat3, Mat4)
- **@arcanvas/color**: Color spaces (sRGB, OKLCH, Display P3) with conversion utilities
- **@arcanvas/interaction**: Input abstraction (pointer, keyboard, gamepad events)

### Kernel (Graphics Abstraction)

**@arcanvas/gfx** defines WebGPU-style interfaces:

```typescript
interface GfxDevice {
  createBuffer(descriptor: GfxBufferDescriptor): GfxBuffer;
  createTexture(descriptor: GfxTextureDescriptor): GfxTexture;
  createRenderPipeline(descriptor: GfxRenderPipelineDescriptor): GfxRenderPipeline;
  createCommandEncoder(): GfxCommandEncoder;
  // ...
}
```

Key concepts:
- **Explicit API**: No hidden state, all operations are explicit
- **Bind Groups**: Resource bindings grouped by update frequency
- **Pipeline Layouts**: Declare resource layout upfront
- **Command Encoding**: Record then submit

### Adapters

**@arcanvas/webgpu**: Thin wrapper around native WebGPU
- Direct mapping to GPUDevice, GPUBuffer, etc.
- Full feature support

**@arcanvas/webgl2**: WebGL2 emulation of WebGPU concepts
- Bind groups emulated via uniform blocks + textures
- Command buffers are immediate (WebGL is synchronous)
- No compute shader support

### Scene / Runtime

**@arcanvas/scene**: Entity-component scene graph
- TreeNode: Hierarchical parent-child relationships
- Entity: Base unit with transform and components
- Scene: Root container for entities

**@arcanvas/runtime**: Application infrastructure
- EventBus: Typed publish/subscribe system
- FrameLoop: Animation frame management
- CanvasHost: Canvas DPR and resize handling

### Features

**@arcanvas/selection**: Dimension-agnostic selection system
- SelectionManager: Track selected entities
- Handle/HandleSet: Resize/rotate handles

**@arcanvas/typography**: Text rendering
- Font loading (OpenType.js)
- Glyph triangulation (earcut)
- MSDF text support

## Design Patterns

### Dependency Inversion

Core depends on abstractions (`@arcanvas/gfx` interfaces), not concrete implementations. Applications choose which adapter to use at runtime:

```typescript
// Application chooses implementation
const adapter = isWebGPUSupported()
  ? await import("@arcanvas/webgpu").then((m) => m.requestAdapter())
  : await import("@arcanvas/webgl2").then((m) => m.requestAdapter({ canvas }));
```

### Typed Events

The EventBus provides compile-time type safety:

```typescript
interface AppEvents {
  resize: { width: number; height: number };
  frame: { deltaTime: number };
}

const bus = new EventBus<AppEvents>();
bus.on("resize", ({ width, height }) => { /* typed payload */ });
bus.emit("resize", { width: 800, height: 600 });
```
