# Arcanvas Overview

Arcanvas is a modular, multi-dimensional canvas engine for building Figma-like editors, game engines, and 2D/3D visualizations. It follows a "Puzzles and Bricks" philosophy—the engine is a lightweight core that orchestrates interchangeable modules.

## Architecture

The project is structured in layers with dependencies flowing downward:

```
Foundation (zero deps):
  @arcanvas/math          # N-dimensional Vector & Matrix
  @arcanvas/color         # Color space management (sRGB, OKLCH, P3)
  @arcanvas/interaction   # Input handling (Pointer, Keyboard, Gamepad)

Kernel (WebGPU-style API):
  @arcanvas/gfx           # Graphics abstraction (device, pipelines, resources)

Adapters:
  @arcanvas/webgpu        # Native WebGPU implementation
  @arcanvas/webgl2        # WebGL2 backcompat implementation

Scene/Runtime:
  @arcanvas/scene         # Scene graph (TreeNode, Entity, Transform)
  @arcanvas/runtime       # App infrastructure (EventBus, FrameLoop, CanvasHost)

Features:
  @arcanvas/selection     # Dimension-agnostic selection
  @arcanvas/typography    # Text rendering with MSDF support
```

## Key Design Principles

### WebGPU-First

The `@arcanvas/gfx` package provides a WebGPU-style explicit API:

- **GfxDevice**: Main entry point for creating resources
- **GfxCommandEncoder**: Record render/compute commands
- **GfxRenderPipeline**: Compiled graphics pipeline state
- **GfxBindGroup**: Resource bindings (uniforms, textures, samplers)

### Backend Agnostic

Applications code against the `@arcanvas/gfx` interfaces. The actual implementation comes from:

- `@arcanvas/webgpu` - For modern browsers with WebGPU support
- `@arcanvas/webgl2` - For broader compatibility (emulates WebGPU concepts)

### Linear Dependencies

Lower layers never import higher layers. This ensures:

- Clear dependency boundaries
- Easy testing and mocking
- Tree-shakeable bundles

## Getting Started

```typescript
import { requestAdapter } from "@arcanvas/webgpu";
import { requestAdapter as requestGL2Adapter } from "@arcanvas/webgl2";

// Try WebGPU first, fallback to WebGL2
const adapter = (await requestAdapter()) || (await requestGL2Adapter({ canvas }));
if (!adapter) throw new Error("No graphics adapter available");

const device = await adapter.requestDevice();

// Create resources
const buffer = device.createBuffer({
  size: 1024,
  usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
});

// Record commands
const encoder = device.createCommandEncoder();
const pass = encoder.beginRenderPass({ colorAttachments: [...] });
pass.setPipeline(pipeline);
pass.draw(3);
pass.end();

// Submit
device.queue.submit([encoder.finish()]);
```

## Development

```bash
bun install              # Install dependencies
bun run lint             # Run ESLint
bun run lint:fix         # Auto-fix linting issues
bun run docs:dev         # VitePress docs development
bun run docs:api         # Generate API docs from TypeScript
```
