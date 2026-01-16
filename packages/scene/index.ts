/**
 * @arcanvas/scene - Scene graph abstractions
 *
 * This package provides the core scene graph data structures:
 * - TreeNode: Generic hierarchical tree node
 * - Entity: Named, identifiable node with serialization
 * - Transform: Basic 3D transform (position, rotation, scale)
 * - WorldTransform: High-precision transform for large worlds
 * - Scene: Container for render objects
 * - WorldScene: Scene with floating origin support
 * - Light: Light source data
 */

// Graph structure
export * from "./src/graph/TreeNode";

// Entities
export * from "./src/Entity";

// Transforms
export * from "./src/Transform";
export * from "./src/WorldTransform";

// Scenes
export { Scene, type SceneViewport, type Renderable } from "./src/Scene";
export * from "./src/WorldScene";

// Lights
export * from "./src/Light";

// Interfaces
export * from "./src/interfaces";

// Utils
export * from "./src/utils/uuid";
export * from "./src/utils/WorldVec3";
export * from "./src/utils/WorldOrigin";
