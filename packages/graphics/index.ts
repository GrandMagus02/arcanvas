/**
 * @arcanvas/graphics - Graphics primitives
 *
 * This package provides API-agnostic graphics data structures:
 * - Mesh: Vertex/index data with layout information
 * - Material: Visual appearance description
 * - RenderObject: Mesh + Material + Transform binding
 * - VertexLayout: Vertex attribute descriptions
 * - Renderer: Standard scene renderer
 * - WorldRenderer: Large-scale world renderer with floating origin
 * - DebugMode: Debug visualization modes
 */

// Mesh
export * from "./src/Mesh";

// Materials
export * from "./src/materials";

// Vertex Layout
export * from "./src/vertexLayout";

// Render Object
export * from "./src/RenderObject";
export * from "./src/WorldRenderObject";

// Shapes
export * from "./src/shapes/Curve";
export * from "./src/shapes/Line";
export * from "./src/shapes/Path";

// Backend interface
export * from "./src/IRenderBackend";

// Debug visualization
export * from "./src/DebugMode";

// Renderers
export * from "./src/Renderer";
export * from "./src/WorldRenderer";
