# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arcanvas is a modular, multi-dimensional canvas engine for building Figma-like editors, game engines, and 2D/3D visualizations. It follows a "Puzzles and Bricks" philosophy—the engine is a lightweight core that orchestrates interchangeable modules.

## Development Commands

```bash
bun install              # Install dependencies
bun run play             # Start playground server (localhost:3000)
bun run story            # Start Storybook (port 6006)
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
Foundation (zero deps):
  @arcanvas/math          # N-dimensional Vector & Matrix (Vec2, Vec3, Vec4, Mat2, Mat3, Mat4)
  @arcanvas/color         # Color space management (sRGB, OKLCH, P3)

Core Abstractions:
  @arcanvas/scene         # Scene graph (TreeNode, Entity, Transform, Scene, WorldScene)
  @arcanvas/graphics      # Graphics primitives (Mesh, Material, RenderObject, IRenderBackend, Renderer)
  @arcanvas/interaction   # Input handling (Pointer, Keyboard, Gamepad)
  @arcanvas/selection     # Dimension-agnostic selection (ISelectable, SelectionManager, Handle, HandleSet)

Implementations:
  @arcanvas/backend-webgl # WebGL2 implementation of IRenderBackend (WebGLBackend, ProgramCache, ShaderRegistry)
  @arcanvas/core          # Application orchestrator (Arcanvas, FrameLoop, EventBus, CanvasHost, Stage)

Feature Packages:
  @arcanvas/feature-2d    # 2D rendering (Grid, Polygon2D, BoundingBox2D, HitTest2D, HandleRenderer2D)
  @arcanvas/feature-3d    # 3D rendering (planned)
  @arcanvas/feature-raymarch # SDF raymarching renderer
  @arcanvas/document      # Document model abstraction
  @arcanvas/feature-document-2d # 2D document features
  @arcanvas/tools         # Tool system (Tool, ToolManager, SelectionTool)
  @arcanvas/typography    # Text rendering (FontLoader, GlyphTriangulator, SDF/MSDF text)
  @arcanvas/msdf-generator-rs # Rust/WASM MSDF generator

Convenience (All-in-One):
  @arcanvas/engine-2d     # Re-exports core + scene + graphics + backend + feature-2d
  @arcanvas/engine-3d     # Re-exports core + scene + graphics + backend

Apps:
  apps/playground/        # Dev server (Bun.serve)
  apps/storybook/         # Component documentation
```

### Path Aliases

TypeScript path `@arcanvas/*` maps to `packages/*/index.ts`.

## Architecture Principles

### SOLID in Practice

- **SRP**: Separate data (`Layer`) from rendering (`LayerRenderer`) from serialization (`LayerSerializer`)
- **OCP**: Add features via new packages (e.g., `@arcanvas/feature-4d`), not by modifying core
- **LSP**: All `IRenderBackend` implementations (WebGL2, Canvas2D, WebGPU) are interchangeable
- **ISP**: Distinct interfaces: `IRenderable`, `ISerializable`, `IInteractive`
- **DIP**: Core depends on abstractions (`IRenderBackend`, `ICameraController`), not concrete classes

### Key Abstractions

- **IRenderBackend**: Low-level GPU abstraction (`beginFrame`, `drawMesh`, `endFrame`)
- **Renderer vs WorldRenderer**: Standard scene rendering vs floating-origin for large worlds
- **Stage vs WorldScene**: UI/Editor scene graph vs large-scale game/map scene
- **EventBus<T>**: Typed pub/sub system

### Rendering Pipeline

```
Mesh + Material + WorldTransform = RenderObject
RenderObject → IRenderBackend (WebGL2/WebGPU) → GPU
```

### Layered Dependencies

Lower layers never import higher layers:

```
utils → infrastructure → rendering/scene/camera → systems → Arcanvas
```

## Code Style

- **JSDoc required** for exported functions, classes, and interfaces
- **Strict TypeScript**: `@typescript-eslint/no-unsafe-*` rules enforced
- **200 char line width** (Prettier)
- **Double quotes**, semicolons, ES5 trailing commas
- **GLSL formatting** via prettier-plugin-glsl

## Key Patterns

### Plugin System

Non-essential features are plugins:

- Tools (Brush, Select) → Plugins
- File Formats (PSD, PNG) → Plugins
- UI Overlays → Plugins

Plugins interact via restricted contexts or EventBus, never by direct state mutation.

### Dimension-Agnostic Design

- Core `Node`/`Entity` system doesn't assume 2D or 3D
- Dimension-specific logic lives in feature packages (`feature-2d`, `feature-3d`)
- Math library supports N-dimensional operations

### Selection System (Unified)

- `ISelectable`: Interface for selectable objects
- `SelectionManager`: Manages selection state across dimensions
- `IHandleRenderer`: Renders selection handles (dimension-specific implementations)

## Testing

```bash
bun test                      # Run all tests
bun test <file.test.ts>       # Run specific test file
```

Test files use `*.test.ts` pattern with `bun:test` framework.

## Key Entry Points

- **Application bootstrap**: `packages/core/src/core/Arcanvas.ts` - Main engine class
- **Rendering**: `packages/graphics/src/Renderer.ts` - Standard renderer, `packages/backend-webgl/src/WebGLBackend.ts` - WebGL2 backend
- **Scene graph**: `packages/scene/src/Entity.ts` - Base entity class
- **Materials**: `packages/graphics/src/materials/` - All material types
- **2D features**: `packages/feature-2d/src/` - 2D-specific implementations
- **Selection system**: `packages/selection/src/core/` - Handle, HandleSet, SelectionManager
- **Tools**: `packages/tools/src/` - Tool, ToolManager, SelectionTool
- **Typography**: `packages/typography/src/` - Font loading, glyph triangulation, SDF text
