/**
 * @arcanvas/runtime - Runtime Infrastructure
 *
 * Core infrastructure for running Arcanvas applications:
 * - Canvas management (sizing, DPR, visibility)
 * - Event system (typed pub/sub)
 * - Frame loop (animation, timing)
 *
 * @packageDocumentation
 */

// Events
export { EventBus, createEventBus, type EventHandler, type EventMap, type Unsubscribe } from "./events/EventBus.js";

// Lifecycle
export { FrameLoop, createFrameLoop, type FrameInfo, type FrameCallback, type FrameLoopConfig } from "./lifecycle/FrameLoop.js";

// Canvas
export { CanvasHost, createCanvasHost, type CanvasHostEvents, type CanvasHostConfig } from "./canvas/CanvasHost.js";
