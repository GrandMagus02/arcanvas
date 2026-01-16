# Arcanvas Architecture Plan

This document outlines the architecture for **Arcanvas**, a highly modular, multi-dimensional canvas engine. The design philosophy is **"Puzzles and Bricks"**: the engine is a lightweight core that orchestrates interchangeable modules. It supports native 2D, 3D, and potentially N-dimensional worlds (e.g., 4D), raymarching, and varied rendering backends (WebGL, WebGPU, Canvas2D).

## Core Philosophy

1.  **Minimal Core**: The main engine package acts only as glue (lifecycle, dependency injection, event bus).
2.  **Feature as a Package**: Capabilities like "2D Raster", "3D Meshes", or "Raymarching" are separate, optional packages.
3.  **Backend Agnostic**: Rendering logic is decoupled from the underlying API (WebGL, WebGPU, CPU).
4.  **Dimension Agnostic**: The scene graph foundation supports N-dimensional transformations, allowing easy extension to 4D+ worlds.
5.  **Standalone Utilities**: Math, Color, and IO libraries are completely standalone and usable without the engine.

## Package Structure

The repository is a monorepo organized into granular packages to enforce separation of concerns.

### 1. Foundation (Standalone)

These packages have **zero** dependencies on the engine. They can be used in any project.

- **`@arcanvas/math`**:
  - N-dimensional Vector and Matrix math (Vec2, Vec3, Vec4, Mat3, Mat4, etc.).
  - Geometric primitives (Ray, Box, Frustum) genericized where possible.
  - Noise functions and math helpers.
- **`@arcanvas/color`**:
  - Color space definitions (sRGB, OKLCH, P3).
  - Conversion logic and color manipulation.
  - ICC profile handling.

### 2. Core (The Glue)

- **`@arcanvas/core`**:
  - **Service Locator (DI)**: Manages dependencies between modules.
  - **Event Bus**: Typed pub/sub system for decoupled communication.
  - **Lifecycle**: Init, Update, Render, Destroy loops.
  - **Plugin Manager**: Loads and manages extensions.
  - **Scheduler**: Handles frame requests and background tasks.

### 3. Domain Abstractions

These define the "Shapes" of the puzzle pieces without providing the concrete implementation.

- **`@arcanvas/scene`**:
  - Abstract `Node` and `Scene` classes acting as pure data containers.
  - **Data/Behavior Separation**: `Node` entities hold components (`TransformComponent`, `MeshComponent`, `MaterialComponent`), while Systems/Renderers execute logic.
  - **Multi-Dimensional Transforms**: `Transform` interface abstracts N-dimensional coordinates.
    - `Transform2D`, `Transform3D`, `Transform4D` implementations in feature packages.
    - Math library handles projection logic (N -> 3D -> 2D Screen). Backends always receive 3D/2D coordinates; they don't know about 4D.
- **`@arcanvas/graphics`** (or `@arcanvas/rendering`):
  - **`Mesh`**: Pure data structure (`vertices`, `indices`, `VertexLayout`, `drawMode`). No API-specific buffers here.
  - **`Material`**: API-agnostic description of appearance (`shadingModel`, `baseColor`, `roughness`, `shaderGraphID`).
  - **`RenderObject`**: The distinct unit of rendering (`mesh` + `material` + `worldTransform`) produced by the Scene System.
- **`@arcanvas/rendering`**:
  - **`IRenderBackend`**: Low-level contract for GPU/CPU resource management.
    - Responsibilities: Create/Update Buffers, Textures, Programs.
    - Key Method: `drawMesh({ mesh, material, modelMatrix, viewMatrix, ... })`.
    - The backend implementation (WebGL/WebGPU) translates abstract `Mesh`/`Material` data into API calls.
  - **`IRenderer`**: High-level scene traversal.
    - Sorts `RenderObjects` (by material, depth).
    - Manages `IRenderPass` execution.
  - **`IRenderPass`**: Interface for compositing steps (e.g., `GeometryPass`, `ShadowPass`, `PostProcessPass`).
- **`@arcanvas/input`**:
  - Abstract Input Device interfaces (Pointer, Keyboard, Gamepad).
  - Input mappings and normalization.

### 4. Implementations (The Bricks)

Concrete implementations that can be swapped out.

#### Rendering Backends

- **`@arcanvas/backend-webgl`**: WebGL2 implementation of `IRenderBackend`.
- **`@arcanvas/backend-webgpu`**: WebGPU implementation of `IRenderBackend`.
- **`@arcanvas/backend-canvas2d`**: CPU-based Canvas2D implementation (for legacy/compat).
- **`@arcanvas/backend-headless`**: No-op or software rasterizer for server-side testing/rendering.

#### Feature Sets (Dimensions & Techniques)

- **`@arcanvas/feature-2d`**:
  - 2D specific Nodes (Layers, Sprites).
  - 2D Transform implementation.
  - Raster manipulation and compositing logic.
- **`@arcanvas/feature-3d`**:
  - 3D specific Nodes (Mesh, Camera3D, Light).
  - 3D Transform implementation.
  - Geometry definitions (Box, Sphere, loaded models).
- **`@arcanvas/feature-raymarch`**:
  - **Integration**: Implemented as one or more `IRenderPass`es (e.g., `RaymarchBackgroundPass`, `RaymarchFogPass`).
  - **Compositing**: Uses the same Camera/Light APIs. Reads Depth/Normal buffers from `GeometryPass` to composite volumes correctly.
  - SDF (Signed Distance Field) object definitions (`SDFNode`, `SDFMaterial`).
- **`@arcanvas/feature-4d`** (Example of extensibility):
  - 4D Mesh and Tesseract definitions.
  - 4D-to-3D projection logic.

### 5. Tools & Interaction

- **`@arcanvas/tools`**:
  - `ToolManager` implementation.
  - Base `Tool` class.
  - Standard tools (Select, Move, Pan, Zoom) implemented as separate plugins.
- **`@arcanvas/interaction`**:
  - Hit-testing / Raycasting logic.
  - Gesture recognition.

## Architectural Layers

### Abstraction Layer (Interfaces)

All internal communication uses interfaces.

- The `Engine` talks to `IRenderer`.
- `IRenderer` talks to `IRenderBackend`.
- Tools talk to `ICommandService`.

This allows a user to replace the entire Renderer with a custom one without forking the engine.

### Data Layer

- Scene objects are data-heavy containers (ECS style).
- **Mesh/Material** are pure data descriptions.
- State is separated from behavior (e.g., `Mesh` holds data, `MeshRenderer` draws it).
- Allows for easy serialization and potential off-main-thread processing.

### Execution Layer

- **Main Thread**: UI, Input, high-level Scene management.
- **Worker Pool**: Heavy math, geometry generation, image filtering.
- **GPU**: Rendering and compute shaders.

## Extensibility Guide

### Plugin Registration

Features connect to the core via the Plugin System.

- **Initialization**: A feature plugin (e.g., `feature-3d`) registers:
  - New `Node` / `Component` types (e.g., `MeshNode`).
  - New `IRenderPass`es into the `IRenderer` pipeline.
  - New `Tools` or `Commands`.
- **Modularity**: A project can bundle only what it needs (e.g., `feature-2d` + `backend-canvas2d` only).

### Adding a New Dimension (e.g., Non-Euclidean or 4D)

1.  Import `@arcanvas/scene` and `@arcanvas/math`.
2.  Implement a `Transform4D` and `Node4D`.
3.  Create a `Renderer4D` that projects 4D coordinates to 3D/2D.
4.  Register the new renderer in the DI system.

### Adding a New Rendering API

1.  Implement `IRenderBackend` (e.g., `VulkanBackend` via WASM).
2.  Map the engine's generic buffers/shaders to the new API.
3.  Swap the backend configuration at startup.

### Adding New Tools

1.  Implement the `Tool` interface.
2.  Register with `ToolManager`.
3.  Tools operate via Commands to ensure Undo/Redo support.

## Future Proofing

- **Shaders**: Target a unified strategy using a DSL or AST (e.g., in `@arcanvas/shader`).
  - Transpile to GLSL (WebGL2), WGSL (WebGPU), or CPU logic.
  - Materials reference abstract "Shader Graphs" or IDs, not raw strings.
- **WASM**: Math and physics modules are designed to be replaceable by WASM implementations for performance.
- **Large Worlds / Floating Origin**: Math and Scene layers support "World Coordinates" (double precision) vs "Local Coordinates" (float, camera-relative) to support infinite maps without precision loss.
- **Headless**: The architecture supports running in Node.js/Bun environments for server-side image generation or testing.
