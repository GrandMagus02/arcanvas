/**
 * @arcanvas/engine-2d - Complete 2D Canvas Engine
 *
 * This is a convenience package that re-exports everything needed for 2D rendering.
 * Perfect for end users who want a single import for 2D canvas applications.
 *
 * Usage:
 * ```ts
 * import { Arcanvas, Scene, GridObject, Polygon2DObject, UnlitColorMaterial } from '@arcanvas/engine-2d';
 * ```
 *
 * This package includes:
 * - Core orchestrator (Arcanvas, Camera, Events, Plugins)
 * - Scene graph (Scene, Entity, Transform)
 * - Graphics primitives (Mesh, Material, RenderObject)
 * - WebGL backend
 * - 2D features (Grid, Polygon2D)
 */

// Core orchestrator
export * from "@arcanvas/core";

// Scene graph
export * from "@arcanvas/scene";

// Graphics primitives
export * from "@arcanvas/graphics";

// WebGL backend
export * from "@arcanvas/backend-webgl";

// 2D features
export * from "@arcanvas/feature-2d";
