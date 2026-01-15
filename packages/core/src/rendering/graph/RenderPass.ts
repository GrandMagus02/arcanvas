import type { IRenderContext } from "../context/IRenderContext";

/**
 * Context passed to render passes during execution.
 */
export interface PassContext {
  renderContext: IRenderContext;
  width: number;
  height: number;
}

/**
 *
 */
export abstract class RenderPass {
  abstract name(): string;
  abstract execute(ctx: PassContext): void;
}

