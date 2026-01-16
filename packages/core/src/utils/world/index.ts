/**
 * World-space coordinate utilities for floating origin / camera-relative rendering.
 *
 * These utilities support "infinite world" scenarios where object coordinates
 * can be very large (astronomical scales) while maintaining precision near the camera.
 *
 * @module world
 */

export * from "./WorldVec3";
export * from "./WorldOrigin";
