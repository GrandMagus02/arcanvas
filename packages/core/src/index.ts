// Core orchestrator
export * from "./core/Arcanvas";

// Camera system
export * from "./camera";

// Document model - moved to @arcanvas/document
// These exports are deprecated. Use @arcanvas/document instead.
// export * from "./document/BlendMode";
// export * from "./document/compose2d";
// export * from "./document/Document";
// export * from "./document/io";
// export * from "./document/Layer";
// export * from "./document/SelectionMask";

// Infrastructure
export * from "./infrastructure/canvas/CanvasHost";
export * from "./infrastructure/events/ArcanvasEvents";
export * from "./infrastructure/events/EventBus";
export * from "./infrastructure/events/EventMap";
export * from "./infrastructure/events/EventSystem";
export * from "./infrastructure/interfaces";
export * from "./infrastructure/lifecycle/FrameLoop";

// Plugins
export * from "./plugins";

// Rendering (high-level abstractions)
export * from "./rendering";

// Scene (Stage for UI/Editor mode)
// Note: Entity, TreeNode, etc. are exported from @arcanvas/scene, not from here
// Only Stage and Mesh are specific to core package
export * from "./scene/Stage";
export * from "./scene/Mesh";

// Systems
export * from "./systems";

// Utils
export * from "./utils";
