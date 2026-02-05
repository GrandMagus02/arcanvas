# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arcanvas is a modular, multi-dimensional canvas engine for building Figma-like editors, game engines, and 2D/3D visualizations. It follows a Clean/Hexagonal architecture with Ports/Adapters pattern, designed for WebGPU-first development with WebGL2 backwards compatibility.

## Development Commands

```bash
bun install              # Install dependencies
bun run lint             # Run ESLint
bun run lint:fix         # Auto-fix linting issues
bun run format           # Check Prettier formatting
bun run format:fix       # Auto-format code
bun run build:wasm       # Build Rust/WASM packages
bun test                 # Run all tests
bun test <file.test.ts>  # Run specific test file
bun run docs:dev         # VitePress docs development
bun run docs:api         # Generate API docs from TypeScript
```

### Rust/WASM Development (msdf-generator-rs)

```bash
cd packages/msdf-generator-rs
bun run build            # Build WASM (web target)
bun run build:release    # Build optimized WASM
cargo test               # Run Rust tests
cargo clippy             # Run Rust linter
cargo fmt                # Format Rust code
```

**Important:** Always use Bun, not Node.js/npm/pnpm. Use `bun <file>` instead of `node`, `bun test` instead of jest/vitest.

## Monorepo Architecture

### Package Hierarchy (Dependencies Flow Downward)

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

### Current Packages

```
Foundation (zero deps):
  @arcanvas/math          # N-dimensional Vector & Matrix (Vec2, Vec3, Vec4, Mat2, Mat3, Mat4)
  @arcanvas/color         # Color space management (sRGB, OKLCH, P3)
  @arcanvas/interaction   # Input handling (Pointer, Keyboard, Gamepad)

Kernel (WebGPU-style API):
  @arcanvas/gfx           # Graphics abstraction (GfxDevice, GfxBuffer, GfxTexture, GfxRenderPipeline)

Adapters:
  @arcanvas/webgpu        # Native WebGPU implementation
  @arcanvas/webgl2        # WebGL2 backcompat implementation (emulates WebGPU concepts)

Scene/Runtime:
  @arcanvas/scene         # Scene graph (TreeNode, Entity, Transform)
  @arcanvas/runtime       # App infrastructure (EventBus, FrameLoop, CanvasHost)

Features:
  @arcanvas/selection     # Dimension-agnostic selection (SelectionManager, Handle, HandleSet)
  @arcanvas/typography    # Text rendering (FontLoader, GlyphTriangulator, MSDF text)
  @arcanvas/msdf-generator-rs # Rust/WASM MSDF generator
```

### Path Aliases

TypeScript path `@arcanvas/*` maps to `packages/*/index.ts`.

## Architecture Principles

### WebGPU-First Design

The `@arcanvas/gfx` package provides WebGPU-style explicit API:

- **GfxDevice**: Main entry point for creating resources
- **GfxCommandEncoder**: Record render/compute commands
- **GfxRenderPipeline**: Compiled graphics pipeline state
- **GfxBindGroup**: Resource bindings (uniforms, textures, samplers)

### Dependency Inversion

Applications code against `@arcanvas/gfx` interfaces. Backends implement:
- `@arcanvas/webgpu` - Full feature support
- `@arcanvas/webgl2` - Emulates WebGPU concepts for broader compatibility

### Key Abstractions

- **GfxAdapter**: Entry point for querying capabilities and creating devices
- **GfxDevice**: Creates buffers, textures, pipelines, command encoders
- **GfxQueue**: Submits commands and writes to resources
- **EventBus<T>**: Typed pub/sub system

### Rendering Pipeline

```
ShaderModule + PipelineLayout + VertexBuffers = RenderPipeline
CommandEncoder → RenderPass → Draw calls
Queue.submit([commandBuffer])
```

### Layered Dependencies

Lower layers never import higher layers:

```
Foundation (math, color, interaction)
    ↓
Kernel (gfx)
    ↓
Adapters (webgpu, webgl2)
    ↓
Scene/Runtime (scene, runtime)
    ↓
Features (selection, typography)
```

## Code Style

- **JSDoc required** for exported functions, classes, and interfaces
- **Strict TypeScript**: `@typescript-eslint/no-unsafe-*` rules enforced
- **200 char line width** (Prettier)
- **Double quotes**, semicolons, ES5 trailing commas
- **GLSL formatting** via prettier-plugin-glsl
- **Unused parameters**: Prefix with `_` (e.g., `_descriptor`)

## Key Patterns

### Backend Agnostic Code

```typescript
import { requestAdapter } from "@arcanvas/webgpu";
import { requestAdapter as requestGL2Adapter } from "@arcanvas/webgl2";

// Try WebGPU first, fallback to WebGL2
const adapter = (await requestAdapter()) || (await requestGL2Adapter({ canvas }));
const device = await adapter.requestDevice();
```

### Typed Events

```typescript
interface AppEvents {
  resize: { width: number; height: number };
  frame: { deltaTime: number };
}

const bus = new EventBus<AppEvents>();
bus.on("resize", ({ width, height }) => { /* typed */ });
```

### Dimension-Agnostic Design

- Core `Entity`/`TreeNode` system doesn't assume 2D or 3D
- Dimension-specific logic in feature packages
- Math library supports N-dimensional operations

## Testing

```bash
bun test                      # Run all tests
bun test <file.test.ts>       # Run specific test file
```

Test files use `*.test.ts` pattern with `bun:test` framework.

## Key Entry Points

- **Graphics API**: `packages/gfx/index.ts` - GfxDevice, GfxBuffer, GfxTexture, etc.
- **WebGPU Backend**: `packages/webgpu/src/adapter.ts` - requestAdapter, WebGPUDevice
- **WebGL2 Backend**: `packages/webgl2/src/adapter.ts` - requestAdapter, WebGL2Device
- **Runtime**: `packages/runtime/index.ts` - EventBus, FrameLoop, CanvasHost
- **Scene graph**: `packages/scene/src/Entity.ts` - Base entity class
- **Selection**: `packages/selection/src/core/` - Handle, HandleSet, SelectionManager
- **Typography**: `packages/typography/src/` - Font loading, glyph triangulation
