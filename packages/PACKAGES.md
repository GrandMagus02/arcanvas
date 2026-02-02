# Arcanvas Packages

## Foundation (Standalone)

### Math

- N-dimensional Vector and Matrix math (Vec2, Vec3, Vec4, Mat3, Mat4, etc.)
- Geometric primitives (Ray, Box, Frustum) genericized where possible
- Noise functions and math helpers

### Color

- Color space definitions (sRGB, OKLCH, P3)
- Conversion logic and color manipulation
- ICC profile handling

## Core (The Glue)

### Core

- Service Locator (DI): Manages dependencies between modules
- Event Bus: Typed pub/sub system for decoupled communication
- Lifecycle: Init, Update, Render, Destroy loops
- Plugin Manager: Loads and manages extensions
- Scheduler: Handles frame requests and background tasks

## Domain Abstractions

### Scene

- Abstract `Node` and `Scene` classes acting as pure data containers
- Data/Behavior Separation: `Node` entities hold components
- Multi-Dimensional Transforms: `Transform` interface abstracts N-dimensional coordinates

### Graphics

- `Mesh`: Pure data structure (vertices, indices, VertexLayout, drawMode)
- `Material`: API-agnostic description of appearance
- `RenderObject`: The distinct unit of rendering (mesh + material + worldTransform)
- `IRenderBackend`: Low-level contract for GPU/CPU resource management
- `IRenderer`: High-level scene traversal

### Interaction

- Abstract Input Device interfaces (Pointer, Keyboard, Gamepad)
- Input mappings and normalization
- Gesture recognition
- Click detection and shortcuts

## Implementations

### Backends

#### Backend WebGL

- WebGL2 implementation of `IRenderBackend`

### Feature Sets (Dimensions & Techniques)

#### Feature 2D

- 2D specific Nodes (Layers, Sprites)
- 2D Transform implementation
- Raster manipulation and compositing logic
- **2D Utilities**:
  - `BoundingBox2D`: 2D bounding box calculation
  - `HitTest2D`: 2D point-in-shape hit-testing
  - `HandleRenderer2D`: Renders 2D selection handles
  - `HandleStyles2D`: Photoshop, Konva, Figma styles

#### Feature 3D

- 3D specific Nodes (Mesh, Camera3D, Light)
- 3D Transform implementation
- Geometry definitions (Box, Sphere, loaded models)
- **3D Utilities**:
  - `BoundingBox3D`: 3D bounding box calculation
  - `Raycast3D`: 3D raycasting for hit-testing
  - `HandleRenderer3D`: Renders 3D gizmos (translate, rotate, scale)
  - `HandleStyles3D`: Translate, Rotate, Scale, Universal gizmos

### Tools & Selection

#### Tools

- `ToolManager` implementation
- Base `Tool` class
- Standard tools (Select, Move, Pan, Zoom) implemented as separate plugins

#### Selection

- **Unified Selection System** (dimension-agnostic):
  - `ISelectable`: Interface for objects that can be selected
  - `SelectionManager`: Manages selection state (single/multi-select, selection events)
  - `IHandleRenderer`: Interface for rendering selection handles/outlines
  - `IHandleStyle`: Interface for different handle visual styles
- **Handle System**:
  - `Handle`: Base class for interactive handles (corner, edge, rotation, etc.)
  - `HandleSet`: Collection of handles for a selected object
  - `HandleInteraction`: Handles drag interactions on handles (resize, rotate, skew)
- **Note**: Bounding box calculation and hit-testing are in dimension-specific feature packages
