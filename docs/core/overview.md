# @arcanvas/core

---

Core provides the rendering pipeline, scene graph, and plugins.

- `Arcanvas`: app bootstrapper owning `Renderer`, `Stage`, plugins
- `Renderer`: WebGL state, frame loop, draw hooks
- `Stage`: scene root extending `Node`
- `objects`: `Node`, `Mesh`
- `meshes`: `PlaneMesh`, `TriangleMesh`, `CubeMesh`
- `plugins`: `AutoResizePlugin`

See Classes and Utils pages for API details.
