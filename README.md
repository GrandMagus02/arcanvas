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

- **`@arcanvas/core`**: The "Glue". Handles lifecycle, dependency injection, typed event bus, and plugin management.
- **`@arcanvas/scene`**: (Part of Core) Abstract Scene Graph nodes, transforms, and hierarchy management.
- **`@arcanvas/rendering`**: (Part of Core) Interfaces for Renderers (`IRenderer`) and Backends (`IRenderBackend`).

### Implementations

- **Backend Implementations**: WebGL2 is currently implemented; WebGPU and Canvas2D are planned.
- **Feature Sets**: 2D and 3D logic are separated into features/plugins to keep the core lightweight.

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
|                 | Raymarching          |   🟥   | SDF rendering support.                 |
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
| `bun run lint`         | Runs ESLint across the codebase to identify code quality issues.                    |
| `bun run lint:fix`     | Runs ESLint and automatically fixes auto-fixable problems.                          |
| `bun run format`       | Checks code formatting against Prettier rules.                                      |
| `bun run format:fix`   | Formats all files in the project using Prettier.                                    |
| `bun run docs:dev`     | Starts the VitePress documentation server in development mode.                      |
| `bun run docs:build`   | Builds the static documentation site for deployment.                                |
| `bun run docs:preview` | Previews the built documentation site locally.                                      |
| `bun run docs:api`     | Generates markdown API documentation from TypeScript source files.                  |
