import type { IRenderer } from "../rendering/backend/IRenderer";
import { createRenderer, type Backend } from "../rendering/backend/createRenderer";
import type { RendererOptions } from "../rendering/backend/types";
import type { IRenderContext } from "../rendering/context";
import type { Stage } from "../scene/Stage";

/**
 * Options for configuring a render system.
 */
export interface RenderSystemOptions {
  backend: Backend;
  rendererOptions?: Partial<RendererOptions>;
}

/**
 * Wrapper around IRenderer that connects rendering backend with the scene stage.
 */
export class RenderSystem {
  private _renderer: IRenderer;

  constructor(canvas: HTMLCanvasElement, private _stage: Stage, options: RenderSystemOptions) {
    const { backend, rendererOptions = {} } = options;
    this._renderer = createRenderer(canvas, backend, rendererOptions);

    this._renderer.onDraw((ctx: IRenderContext) => {
      this._stage.draw(ctx);
    });
  }

  get renderer(): IRenderer {
    return this._renderer;
  }

  start(): void {
    this._renderer.start();
  }

  stop(): void {
    this._renderer.stop();
  }

  renderOnce(): void {
    this._renderer.renderOnce();
  }
}
