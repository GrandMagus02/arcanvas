import type { IRenderContext } from "../context/IRenderContext";

/**
 * A function that can be used to draw a scene.
 * Works with abstract IRenderContext, allowing the same draw code to work with different backends.
 */
export type DrawHook = (renderContext: IRenderContext) => void;

/**
 * Options for configuring a renderer.
 */
export interface RendererOptions {
  clearColor: [number, number, number, number];
  depthTest: boolean;
}
