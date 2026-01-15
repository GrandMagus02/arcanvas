# Core Package Architecture Plan

## Overview

This document outlines the architecture plan for the `@arcanvas/core` package - a minimal, extensible rendering engine designed for building Figma-like editors and Photoshop/Aseprite web alternatives. The core follows principles inspired by Unity, Godot, and Unreal Engine, focusing on essential components that can be extended through plugins.

## Design Principles

### Core Tenets

1. **Minimal Core**: Only essential engine functionality lives in core
2. **Extensibility First**: Plugin system enables feature expansion
3. **Separation of Concerns**: Clear boundaries between rendering, scene management, and application logic
4. **WebGL-First**: Optimized for WebGL2 with future WebGPU migration path
5. **Scene Graph Architecture**: Hierarchical node system for flexible composition

### Inspiration from Game Engines

| Engine     | Concept                    | Application in Arcanvas                        |
| ---------- | -------------------------- | ---------------------------------------------- |
| **Unity**  | Component System           | Nodes can have behaviors attached via plugins  |
| **Unity**  | Scene/GameObject Hierarchy | Stage → Node → Mesh hierarchy                  |
| **Godot**  | Node Tree                  | Scene graph with parent-child relationships    |
| **Godot**  | Signal System              | EventBus for decoupled communication           |
| **Unreal** | Render Graph               | RenderGraph with passes for flexible rendering |
| **Unreal** | Material System            | Material abstraction for shader management     |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Application Layer                      │
│  (Figma Editor, Photoshop Tool, Aseprite Clone, etc.)        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      Plugin System                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Tool Plugins │  │ Filter Plugins│  │ UI Plugins  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                         Core Engine                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Arcanvas   │  │    Stage     │  │   Renderer   │        │
│  │  (App Root)  │  │ (Scene Root) │  │  (WebGL)     │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  EventBus    │  │   Camera     │  │ RenderGraph  │        │
│  │  (Signals)   │  │  Manager     │  │  (Passes)    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Application Core (`Arcanvas`)

The root application instance that orchestrates all subsystems.

#### Responsibilities

| Responsibility             | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| **Lifecycle**              | Initialize, start, stop, destroy engine                 |
| **Canvas Management**      | HTMLCanvasElement setup, resize handling, DPR awareness |
| **Subsystem Coordination** | Wire together Stage, Renderer, Camera, Plugins          |
| **Event Hub**              | Central EventBus for cross-system communication         |
| **Plugin Host**            | PluginManager integration                               |

#### State Management

```
Arcanvas
├── canvas: HTMLCanvasElement
├── options: ArcanvasOptions
├── stage: Stage
├── renderer: Renderer
├── cameras: CameraManager
├── plugins: PluginManager
└── events: EventBus
```

> **Implementation Hint**: Arcanvas should be a thin orchestrator. Business logic lives in plugins. Keep it focused on initialization, lifecycle, and delegation to subsystems.

### 2. Scene Graph (`Stage` & `Node`)

Hierarchical tree structure for organizing renderable objects and groups.

#### Node Hierarchy

```
Node (Base)
├── id: string
├── name: string | null
├── parent: Node | null
├── children: Node[]
└── [transform properties]

Mesh extends Node
├── vertices: Float32Array
├── indices: Uint16Array
├── material: Material
└── render(gl, program): void

Stage extends Node
├── canvas: HTMLCanvasElement
├── width: number
├── height: number
└── draw(gl, program): void
```

#### Node Operations

| Operation         | Purpose               | Complexity |
| ----------------- | --------------------- | ---------- |
| `add(child)`      | Attach child node     | O(1)       |
| `remove()`        | Detach from parent    | O(1)       |
| `traverse(fn)`    | Depth-first traversal | O(n)       |
| `find(predicate)` | Search subtree        | O(n)       |
| `contains(node)`  | Check ancestry        | O(depth)   |

> **Implementation Hint**: Node operations should prevent cycles. Use `ensureCanAttach()` to validate before adding children. Cache computed properties (bounds, transforms) and invalidate on hierarchy changes.

### 3. Rendering Pipeline

#### Renderer Architecture

```
Renderer
├── gl: WebGLRenderingContext
├── program: WebGLProgram (shared default)
├── drawHooks: DrawHook[]
├── options: RendererOptions
└── frame(): void
    ├── viewport setup
    ├── clear buffers
    └── execute drawHooks
```

#### Render Graph System

```
RenderGraph
├── passes: RenderPass[]
└── execute(ctx: PassContext): void

RenderPass (abstract)
├── name(): string
└── execute(ctx: PassContext): void

PassContext
├── gl: WebGLRenderingContext
├── width: number
└── height: number
```

#### Render Pass Types

| Pass Type           | Purpose                   | Execution Order |
| ------------------- | ------------------------- | --------------- |
| **ClearPass**       | Clear color/depth buffers | First           |
| **DrawStagePass**   | Render scene graph        | Middle          |
| **PostProcessPass** | Apply filters/effects     | Later (future)  |
| **UIOverlayPass**   | Render UI elements        | Last (future)   |

> **Implementation Hint**: RenderGraph should support pass dependencies. Use a topological sort to order passes. Each pass should be isolated and testable independently. Consider pass culling (skip passes that don't affect final output).

### 4. Camera System

#### Camera Architecture

```
CameraManager
├── cameras: Map<string, Camera>
├── active: Camera | null
└── setActive(id): void

Camera
├── position: Vector3
├── view: ViewMatrix
├── projection: ProjectionMatrix
└── events: EventBus
```

#### Camera Types (Future Extensions)

| Type            | Use Case              | Projection               |
| --------------- | --------------------- | ------------------------ |
| **Camera2D**    | 2D editors, pixel art | Orthographic             |
| **Camera3D**    | 3D viewports          | Perspective/Orthographic |
| **CameraOrtho** | Technical drawings    | Orthographic             |

> **Implementation Hint**: Cameras should be reactive to canvas resize events. Update projection matrices automatically. Support multiple cameras for split-view scenarios (future). Camera transforms should be separate from scene node transforms.

### 5. GPU Resource Management

#### Shader & Program Management

```
ShaderLibrary
├── modules: Map<string, string>
└── get(id): string | undefined

ProgramCache
├── cache: Map<string, WebGLProgram>
└── getOrCreate(gl, key, vs, fs): WebGLProgram

StateCache
├── [WebGL state tracking]
└── minimize state changes
```

#### Material System

```
Material
├── program: WebGLProgram
├── uniforms: Record<string, UniformValue>
└── bind(gl): void
```

#### Uniform Types

| Type             | WebGL Function    | Use Case                     |
| ---------------- | ----------------- | ---------------------------- |
| `1f`             | `uniform1f`       | Float scalars                |
| `2f`             | `uniform2f`       | Vec2 (UV, position)          |
| `3f`             | `uniform3f`       | Vec3 (RGB, position)         |
| `4f`             | `uniform4f`       | Vec4 (RGBA, quaternion)      |
| `1i`             | `uniform1i`       | Integer flags, texture units |
| `2i`, `3i`, `4i` | `uniform2i/3i/4i` | Integer vectors              |

> **Implementation Hint**: Cache WebGL programs aggressively. Use content-addressable keys (hash of shader source). Track WebGL state to minimize redundant calls (StateCache). Materials should be immutable once created for a render pass.

### 6. Document Model (2D Editor Support)

#### Layer Hierarchy

```
DocumentModel
├── id: string
├── width: number
├── height: number
├── colorProfile?: string
└── root: GroupLayer

BaseLayer (abstract)
├── id: string
├── name: string
├── parent: GroupLayer | null
├── visible: boolean
├── locked: boolean
├── opacity: number
├── blendMode: BlendMode
├── transform: Transform2D
└── dirty tracking

GroupLayer extends BaseLayer
└── children: BaseLayer[]

RasterLayer extends BaseLayer
├── width: number
├── height: number
└── surface: OffscreenCanvas

AdjustmentLayer extends BaseLayer
└── [filter parameters]
```

#### Blend Modes

| Mode         | Use Case             | Implementation         |
| ------------ | -------------------- | ---------------------- |
| **Normal**   | Standard compositing | `source-over`          |
| **Multiply** | Darkening            | `multiply`             |
| **Screen**   | Lightening           | `screen`               |
| **Overlay**  | Contrast enhancement | `overlay`              |
| **Add**      | Brightness boost     | Custom shader (future) |

> **Implementation Hint**: Layers should track dirty regions (rectangles) for incremental rendering. Use OffscreenCanvas for layer surfaces to enable worker-based processing. Blend modes should be extensible via plugins.

### 7. Event System

#### EventBus Architecture

```
EventBus<T extends string>
├── map: Map<T, Set<HookFn>>
├── on(event, fn): UnsubscribeFn
├── once(event, fn): UnsubscribeFn
├── off(event, fn): void
└── emit(event, ...args): void
```

#### Event Flow

```
Component A emits event
    ↓
EventBus routes to subscribers
    ↓
Component B receives event
    ↓
Component B updates state
    ↓
Component B may emit new events
```

#### Standard Events

| Event             | Emitter  | Payload         | Purpose                 |
| ----------------- | -------- | --------------- | ----------------------- |
| `resize`          | Arcanvas | `width, height` | Canvas size changed     |
| `focus`           | Arcanvas | -               | Canvas gained focus     |
| `blur`            | Arcanvas | -               | Canvas lost focus       |
| `camera:move`     | Camera   | `x, y, z`       | Camera position changed |
| `camera:activate` | Camera   | -               | Camera became active    |
| `layer:dirty`     | Layer    | `rect?`         | Layer needs re-render   |

> **Implementation Hint**: Use typed event keys (string literals) for better IDE support. Consider event batching for high-frequency events. Provide cleanup helpers to prevent memory leaks from unsubscribed handlers.

### 8. Plugin System

#### Plugin Architecture

```
PluginManager
├── plugins: Map<PluginLike, Plugin>
├── use(Plugin, opts): void
├── has(Plugin): boolean
├── get(Plugin): T | undefined
└── destroy(Plugin): void

Plugin<T> (abstract)
├── app: Arcanvas
├── opts: T
├── setup(): void
└── destroy(): void
```

#### Plugin Lifecycle

```
1. Plugin instantiated with app and opts
2. Plugin.setup() called
3. Plugin registers hooks, tools, filters
4. Plugin.active = true
5. [Application runs]
6. Plugin.destroy() called on cleanup
7. Plugin unregisters resources
```

#### Plugin Types

| Type              | Purpose                 | Examples                 |
| ----------------- | ----------------------- | ------------------------ |
| **Tool Plugin**   | Input handling, drawing | BrushTool, SelectionTool |
| **Filter Plugin** | Image processing        | BlurFilter, ColorAdjust  |
| **UI Plugin**     | Interface components    | LayerPanel, Toolbar      |
| **System Plugin** | Core enhancements       | AutoResizePlugin         |

> **Implementation Hint**: Plugins should be isolated. Use dependency injection via Arcanvas instance. Provide plugin context with limited API surface. Consider plugin sandboxing via Workers for untrusted plugins (future).

### 9. Frame Loop & Timing

#### FrameLoop Architecture

```
FrameLoop
├── callback: FrameCallback
├── options: FrameLoopOptions
├── running: boolean
└── start/stop(): void

FrameCallback: (dtMs: number, timeMs: number) => void
```

#### Timing Modes

| Mode               | Description       | Use Case                    |
| ------------------ | ----------------- | --------------------------- |
| **Variable Delta** | Real frame time   | Smooth animations           |
| **Fixed Delta**    | Constant timestep | Physics simulation (future) |

> **Implementation Hint**: FrameLoop should be optional. Renderer can drive its own loop via requestAnimationFrame. Separate update loop from render loop for better control. Consider frame rate limiting for battery efficiency.

## Data Flow Diagrams

### Rendering Flow

```
User Interaction
    ↓
Plugin handles input
    ↓
Stage/Document updates
    ↓
Dirty regions marked
    ↓
Renderer.frame() called
    ↓
RenderGraph.execute()
    ↓
ClearPass → DrawStagePass → [PostProcess]
    ↓
WebGL draw calls
    ↓
Canvas updated
```

### Scene Graph Traversal

```
Stage.draw(gl, program)
    ↓
Stage.traverse((node) => {
    if (node instanceof Mesh) {
        node.render(gl, program)
    }
})
    ↓
For each Mesh:
    - Bind material
    - Upload vertices/indices
    - Set uniforms
    - Draw elements
```

### Event Propagation

```
Component A: emit('custom:event', data)
    ↓
EventBus: routes to subscribers
    ↓
Component B: receives event
    ↓
Component B: updates internal state
    ↓
Component B: may emit('state:changed')
    ↓
[Cycle continues]
```

## Component Dependencies

```
Arcanvas
├── depends on → Stage
├── depends on → Renderer
├── depends on → CameraManager
├── depends on → PluginManager
└── depends on → EventBus

Renderer
├── depends on → RenderGraph
└── uses → WebGLRenderingContext

Stage
├── extends → Node
└── contains → Mesh nodes

Camera
├── uses → ViewMatrix
├── uses → ProjectionMatrix
└── uses → EventBus

Material
├── uses → WebGLProgram
└── uses → ProgramCache (indirect)
```

## Extension Points

### For Figma-like Editors

| Extension          | Implementation             | Location                |
| ------------------ | -------------------------- | ----------------------- |
| **Vector Shapes**  | New Mesh types             | `meshes/`               |
| **Text Rendering** | TextLayer + font rendering | `document/TextLayer.ts` |
| **Constraints**    | Layout system plugin       | Plugin                  |
| **Components**     | Reusable node groups       | `objects/Component.ts`  |

### For Photoshop/Aseprite Alternatives

| Extension                | Implementation            | Location                    |
| ------------------------ | ------------------------- | --------------------------- |
| **Brush Engine**         | Stamp-based painting      | Plugin                      |
| **Selection Tools**      | Marquee, lasso, wand      | Plugin                      |
| **Filters**              | Image processing passes   | Plugin                      |
| **History/Undo**         | Command pattern           | Plugin                      |
| **Tile-based Rendering** | Large canvas optimization | `renderer/TiledRenderer.ts` |

## Performance Considerations

### Optimization Strategies

| Strategy                  | Implementation                  | Impact      |
| ------------------------- | ------------------------------- | ----------- |
| **Dirty Region Tracking** | Only re-render changed areas    | High        |
| **Program Caching**       | Reuse compiled shaders          | Medium      |
| **State Batching**        | Minimize WebGL state changes    | Medium      |
| **Frustum Culling**       | Skip off-screen objects         | High (3D)   |
| **Level of Detail**       | Reduce complexity at distance   | Medium (3D) |
| **Worker Offloading**     | Process filters off-main-thread | High        |

> **Implementation Hint**: Start with dirty region tracking for 2D editors. Use requestAnimationFrame for smooth 60fps. Profile WebGL calls with WebGL Inspector. Consider render targets for complex compositing.

## Testing Strategy

### Unit Test Coverage

| Component    | Test Focus                             |
| ------------ | -------------------------------------- |
| **Node**     | Hierarchy operations, cycle prevention |
| **EventBus** | Subscription, emission, cleanup        |
| **Renderer** | State management, frame execution      |
| **Camera**   | Matrix updates, projection changes     |
| **Material** | Uniform binding, program usage         |

### Integration Test Scenarios

1. **Scene Rendering**: Create stage, add meshes, verify WebGL calls
2. **Event Flow**: Emit events, verify subscribers receive them
3. **Plugin Lifecycle**: Load plugin, verify setup/destroy
4. **Camera Switching**: Change active camera, verify projection updates

## Migration Path to WebGPU

### Abstraction Layer

```
RenderBackend (interface)
├── Canvas2DBackend (current, MVP)
├── WebGL2Backend (current)
└── WebGPUBackend (future)

Renderer
└── uses → RenderBackend
```

> **Implementation Hint**: Abstract WebGL calls behind RenderBackend interface. This allows swapping WebGL for WebGPU without changing Renderer code. Start with WebGL2, add WebGPU backend later.

## File Structure

```
packages/core/src/
├── Arcanvas.ts                 # Application root
├── Stage.ts                    # Scene root node
├── EventBus.ts                 # Event system
├── FrameLoop.ts                # Timing system
├── Plugin.ts                   # Plugin base class
├── PluginManager.ts            # Plugin registry
│
├── objects/
│   ├── Node.ts                 # Scene graph base
│   └── Mesh.ts                 # Renderable object
│
├── renderers/
│   └── Renderer.ts             # WebGL renderer
│
├── rendergraph/
│   ├── RenderGraph.ts          # Pass orchestration
│   ├── RenderPass.ts           # Pass interface
│   └── passes/
│       ├── ClearPass.ts        # Clear buffers
│       └── DrawStagePass.ts    # Render scene
│
├── camera/
│   ├── Camera.ts               # View/projection
│   ├── CameraManager.ts        # Camera registry
│   └── CameraEvents.ts         # Camera events
│
├── gpu/
│   ├── Material.ts             # Shader material
│   ├── ProgramCache.ts         # Program caching
│   ├── ShaderLibrary.ts        # Shader storage
│   └── StateCache.ts           # GL state tracking
│
├── document/
│   ├── Document.ts             # Document model
│   ├── Layer.ts                # Layer hierarchy
│   ├── BlendMode.ts            # Blend modes
│   └── compose2d.ts            # 2D compositing
│
├── meshes/
│   ├── Triangle.ts             # Basic mesh
│   ├── Plane.ts                # Plane mesh
│   ├── Grid.ts                 # Grid mesh
│   └── Cube.ts                 # 3D cube
│
└── utils/
    ├── Manager.ts              # Generic manager
    ├── Subscribable.ts         # Event mixin
    ├── uuid.ts                 # ID generation
    └── [matrix utilities]       # Math helpers
```

## Implementation Phases

### Phase 1: Core Foundation ✅ (Current)

- [x] Arcanvas application root
- [x] Node scene graph
- [x] Basic Renderer with WebGL
- [x] EventBus system
- [x] Camera system
- [x] Plugin system skeleton

### Phase 2: Rendering Enhancements

- [ ] RenderGraph with pass dependencies
- [ ] Material system improvements
- [ ] StateCache for WebGL optimization
- [ ] Dirty region tracking
- [ ] Render target support

### Phase 3: Document Model

- [ ] Layer compositing pipeline
- [ ] Blend mode shader support
- [ ] OffscreenCanvas integration
- [ ] Selection mask rendering
- [ ] Transform matrix caching

### Phase 4: Extensibility

- [ ] Plugin API documentation
- [ ] Plugin context isolation
- [ ] Worker-based plugin support (future)
- [ ] Render backend abstraction
- [ ] WebGPU migration path

## Key Design Decisions

### Why Scene Graph?

> Scene graphs provide flexible composition. Nodes can be grouped, transformed, and traversed efficiently. This pattern scales from simple 2D editors to complex 3D scenes.

### Why Plugin System?

> Plugins enable feature expansion without core bloat. Tools, filters, and UI components can be developed independently. This keeps core minimal and focused.

### Why Render Graph?

> Render graphs provide flexible rendering pipelines. Passes can be added, removed, or reordered without changing core renderer code. This supports post-processing, multi-pass rendering, and future WebGPU migration.

### Why Separate Camera System?

> Cameras are viewport controllers, not scene objects. Separating them allows multiple views, split-screen rendering, and camera-specific effects. This is essential for editor applications.

## Conclusion

The core package provides a minimal, extensible foundation for building web-based graphics editors. By focusing on essential components (scene graph, rendering, events, plugins) and leaving advanced features to plugins, we maintain simplicity while enabling powerful extensions.

The architecture draws inspiration from proven game engine patterns while adapting them for web-specific constraints (WebGL, single-threaded JavaScript, plugin isolation). This balance ensures the core remains maintainable while supporting complex editor applications.
