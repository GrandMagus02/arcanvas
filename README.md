# Arcanvas

Arcanvas is a highly modular, multi-dimensional canvas engine designed for building advanced graphic tools (Figma-like editors, Photoshop alternatives), game engines, and scalable 2D/3D visualizations.

It follows a **"Puzzles and Bricks"** philosophy: the engine is a lightweight core that orchestrates interchangeable modules. Nothing is hard-coded—rendering backends, input handling, and even dimensions (2D, 3D, 4D) are swappable plugins.

## Architecture & Modules

The project is a monorepo organized into granular packages to ensure separation of concerns:

### Foundation (Standalone)

These packages have zero dependencies on the engine and can be used in any project.

- **`@arcanvas/vector`** / **`@arcanvas/matrix`**: N-dimensional math libraries optimized for graphics.
- **`@arcanvas/color`**: Color space management (sRGB, OKLCH, etc.) and conversion logic.

### Core & Abstractions

- **`@arcanvas/core`**: The "Glue". Minimal orchestrator handling lifecycle, dependency injection, typed event bus, camera system, and plugin management.
- **`@arcanvas/scene`**: Scene graph abstractions - TreeNode, Entity, Transform, Scene, WorldScene with floating origin support.
- **`@arcanvas/graphics`**: Graphics primitives - Mesh, Material, RenderObject, IRenderBackend interface, Renderer.
- **`@arcanvas/backend-webgl`**: WebGL2 implementation of IRenderBackend - WebGLBackend, ProgramCache, ShaderRegistry.

### Feature Packages

- **`@arcanvas/feature-2d`**: 2D rendering features - GridObject, Polygon2DObject, PolygonObject, geometry utilities.
- **`@arcanvas/feature-3d`**: (Planned) 3D rendering features - 3D meshes, materials, etc.

### Convenience Packages (All-in-One)

For end users who want a single import:

- **`@arcanvas/engine-2d`**: Complete 2D engine - re-exports from core, scene, graphics, backend-webgl, feature-2d.
- **`@arcanvas/engine-3d`**: Complete 3D engine - re-exports from core, scene, graphics, backend-webgl (feature-3d when ready).

### Tree-Shaking Support

All packages are optimized for tree-shaking:
- ✅ ESM-only exports (`"type": "module"`)
- ✅ `sideEffects: false` in package.json (or minimal side-effect lists)
- ✅ No global side effects on import
- ✅ Named exports for granular imports

## Feature Status

### Legend

| Status          | Color | Description                                     |
| :-------------- | :---: | :---------------------------------------------- |
| **Not Started** |  🟥   | Planned but no code written yet.                |
| **Concept**     |  🟧   | Design/Architecture phase, no implementation.   |
| **In Progress** |  🟨   | Implementation started, but incomplete.         |
| **MVP**         |  🟩   | Basic functionality working, may lack features. |
| **Polished**    |  🟦   | Feature complete, tested, and stable.           |
| **Optimized**   |  🟪   | Highly optimized, production-ready.             |

### Development Roadmap

| Module          | Feature              | Status | Notes                                  |
| :-------------- | :------------------- | :----: | :------------------------------------- |
| **Foundation**  | Vector/Matrix Math   |   🟩   | Core N-dimensional math is ready.      |
|                 | Color Management     |   🟩   | Basic spaces supported, need profiles. |
| **Core System** | Event Bus            |   🟩   | Typed, decoupled pub/sub system.       |
|                 | Service Locator (DI) |   🟩   | Dependency injection system.           |
|                 | Plugin System        |   🟩   | Lifecycle management working.          |
|                 | Scheduler/Loop       |   🟩   | Basic RAF loop implemented.            |
| **Scene Graph** | Node Hierarchy       |   🟩   | Parent/Child, Scene root.              |
|                 | Transform System     |   🟩   | Matrix-based transforms.               |
|                 | Camera System        |   🟩   | CameraManager, Controllers.            |
|                 | Large Worlds         |   🟥   | Floating origin / Double precision.    |
| **Rendering**   | WebGL2 Backend       |   🟩   | Basic mesh rendering working.          |
|                 | Render Graph         |   🟨   | Pass system designed, partial impl.    |
|                 | Materials/Shaders    |   🟨   | Basic materials, need ShaderGraph.     |
|                 | Dirty Rects          |   🟥   | Partial rendering optimization.        |
|                 | WebGPU Backend       |   🟥   | Planned for future.                    |
|                 | Raymarching          |   🟨   | SDF package + RaymarchPass; use RenderGraph path. |
| **Tools**       | Interaction          |   🟥   | Raycasting/Hit-testing.                |
|                 | Editor Tools         |   🟥   | Select, Brush, Transform tools.        |
|                 | History/Undo         |   🟥   | Command pattern implementation.        |

## Getting Started

### Prerequisites

- [Bun](https://bun.com) v1.0+ (Required for package management and runtime)

### Installation

Clone the repository and install dependencies:

```bash
bun install
```

### Running the Playground

Start the development playground to test the engine:

```bash
bun run play
```

This will start the server defined in `apps/playground/server.ts`. Open the URL shown in your terminal (usually `http://localhost:3000`).

## Scripts

The `package.json` includes several helper scripts for development:

| Script                 | Description                                                                         |
| :--------------------- | :---------------------------------------------------------------------------------- |
| `bun run play`         | Starts the playground server (`apps/playground/server.ts`) for interactive testing. |
| `bun run story`        | Starts the Storybook web server (`apps/storybook`) for component documentation.     |
| `bun run lint`         | Runs ESLint across the codebase to identify code quality issues.                    |
| `bun run lint:fix`     | Runs ESLint and automatically fixes auto-fixable problems.                          |
| `bun run format`       | Checks code formatting against Prettier rules.                                      |
| `bun run format:fix`   | Formats all files in the project using Prettier.                                    |
| `bun run docs:dev`     | Starts the VitePress documentation server in development mode.                      |
| `bun run docs:build`   | Builds the static documentation site for deployment.                                |
| `bun run docs:preview` | Previews the built documentation site locally.                                      |
| `bun run docs:api`     | Generates markdown API documentation from TypeScript source files.                  |
