# Arcanvas: Texture Graph + Editor Architecture (Updated)

Primary v1 product:

- A Substance-Designer–style **node-based texture editor**
- A reusable **node-editor module** that can build graph editors quickly
- WebGPU-first runtime, WebGL2 fallback

Guiding principles:

- Separate **Graph Model** from **Graph UI** from **GPU Evaluation**
- No magic at low-level; inspectable pipelines/shaders at mid/high levels
- React/Vue wrappers are thin layers on top of a framework-agnostic core

---

## Packages (Monorepo)

## Foundation (standalone)

- `@arcanvas/math`
- `@arcanvas/color`
- `@arcanvas/io`

---

## Core Glue

- `@arcanvas/core`
  - plugin registration
  - scheduler (main thread + workers)
  - diagnostics hooks

---

## Low-level GPU Kit (backend-agnostic)

- `@arcanvas/gpu`
  - explicit resources: buffers/textures/samplers
  - explicit passes/encoders
  - pipeline + bind groups/layouts

Backends:

- `@arcanvas/backend-webgpu`
- `@arcanvas/backend-webgl2`
- `@arcanvas/backend-canvas2d` (optional)
- `@arcanvas/backend-headless` (for tests/baking where possible)

---

## Node Graph (framework-agnostic)

- `@arcanvas/nodegraph`
  - Graph data model:
    - Node, Port, Edge, Graph
    - Types: scalar, vec, color, texture2D, etc.
  - Validation:
    - type checking, cycle prevention, port compatibility
  - Serialization:
    - stable JSON schema + versioning/migrations
  - Commands:
    - add/remove node, connect/disconnect, set param, move node (undo/redo)

---

## Texture Graph Runtime (mid-level)

- `@arcanvas/texture-graph`
  - Node definitions:
    - metadata (inputs/outputs/params)
    - backend capabilities (WebGPU/WebGL2)
  - Compiler:
    - DAG build + topological sort
    - dirty propagation
    - compile to an execution plan (multi-pass)
  - Evaluator:
    - evaluate selected output(s) at requested resolution/format
    - caching keyed by node params + input versions + resolution
    - incremental recompute

Backend implementations:

- `@arcanvas/texture-graph-webgpu`
  - render-to-texture passes and/or compute passes
- `@arcanvas/texture-graph-webgl2`
  - fragment-pass GPGPU fallback (float textures where available)

Shader utilities (non-magical):

- `@arcanvas/shader`
  - raw WGSL/GLSL modules + typed binding layout helpers
  - optional chunk/includes + compile-time constants
  - debug: dump final shader source + bindings per pass

---

## Node Editor Kit (high-level UI)

- `@arcanvas/node-editor-core`
  - editor state machine (selection, dragging, connecting)
  - layout helpers (grid, snapping, frames/comments)
  - hit-testing hooks (node/port/edge)
  - view-model outputs for rendering
  - integrates with `@arcanvas/interaction` + command system

Wrappers:

- `@arcanvas/node-editor-react`
- `@arcanvas/node-editor-vue`

Optional:

- `@arcanvas/node-editor-widgets`
  - parameter panels (sliders, color pickers, curve editors)

---

## Interaction System (shared by editor + future brushes)

- `@arcanvas/interaction`
  - Layer 1: normalized pointer/keyboard/wheel state
    - coordinates, deltas, velocity, pressure/tilt
    - coalesced events support
  - Layer 2: gestures
    - drag, pan, zoom, pinch, box-select, etc.
  - Layer 3: shortcut/chord engine with contexts
    - chords, sequences (optional), priorities, "when" predicates
    - centralized preventDefault
    - dispatch actions into command/tool systems

---

## Future: Photoshop/Illustrator-style tools

- `@arcanvas/brush`
  - stroke processing (smoothing, spacing, pressure curves)
  - GPU stamping/compositing passes
- `@arcanvas/vector`
  - paths, boolean ops, stroking/offsetting (later, possibly WASM)
- `@arcanvas/editor-shell`
  - docking panels, timelines, history, export/import
