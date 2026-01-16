/**
 * @arcanvas/engine-3d - Complete 3D Canvas Engine
 *
 * This is a convenience package that re-exports everything needed for 3D rendering.
 * Perfect for end users who want a single import for 3D canvas applications.
 *
 * Usage:
 * ```ts
 * import { Arcanvas, Scene, Mesh, PBRMaterial, RenderObject } from '@arcanvas/engine-3d';
 * ```
 *
 * This package includes:
 * - Core orchestrator (Arcanvas, Camera, Events, Plugins)
 * - Scene graph (Scene, Entity, Transform, WorldScene)
 * - Graphics primitives (Mesh, Material, RenderObject)
 * - WebGL backend
 * - Future: 3D features (Meshes, Materials, etc.)
 *
 * Note: 3D-specific features will be added via @arcanvas/feature-3d when implemented.
 */

// Core orchestrator
export * from "@arcanvas/core";

// Scene graph
export * from "@arcanvas/scene";

// Graphics primitives
export * from "@arcanvas/graphics";

// WebGL backend
export * from "@arcanvas/backend-webgl";

// Future: 3D features
// export * from "@arcanvas/feature-3d";
