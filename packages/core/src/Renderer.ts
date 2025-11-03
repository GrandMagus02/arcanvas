/**
 * A function that can be used to draw a scene.
 */
export type DrawHook = (gl: WebGLRenderingContext, program: WebGLProgram) => void;

/**
 * Options for configuring a renderer.
 */
export interface RendererOptions {
  clearColor: [number, number, number, number];
  depthTest: boolean;
}

const _DEFAULT_RENDERER_OPTIONS: RendererOptions = {
  clearColor: [0, 0, 0, 1],
  depthTest: true,
};

/**
 * A class that can be used to render a scene.
 */
export class Renderer {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _gl: WebGLRenderingContext | null;
  private readonly _program: WebGLProgram | null = null;
  private readonly _drawHooks: DrawHook[] = [];
  private _rafId: number | null = null;
  private _running = false;
  private _options: RendererOptions = Object.assign({}, _DEFAULT_RENDERER_OPTIONS);
  private _scissorRect: { x: number; y: number; w: number; h: number } | null = null;
  private _onContextLost = (e: Event) => {
    e.preventDefault();
    this.stop();
  };
  private _onContextRestored = () => {
    // Re-apply GL state and attempt to continue rendering.
    this.applyGlState();
    if (this._running) this.start();
  };

  // Simple built-in render graph: Clear -> drawHooks -> Present (implicit)
  // For now, we keep drawHooks, but ensure state is set for PM alpha/sRGB.

  constructor(canvas: HTMLCanvasElement, options: Partial<RendererOptions> = {}) {
    let gl = canvas.getContext("webgl");
    if (gl === null) {
      console.warn("WebGL not supported, falling back to experimental-webgl");
      gl = canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    }
    if (!gl) {
      throw new Error("WebGL not supported");
    }

    this._canvas = canvas;
    this._gl = gl;
    this._program = gl.createProgram();
    if (!this._program) {
      throw new Error("Failed to create program");
    }

    this._options = Object.assign({}, _DEFAULT_RENDERER_OPTIONS, options);
    this.applyGlState();

    // Context loss/restore hooks
    this._canvas.addEventListener("webglcontextlost", this._onContextLost as EventListener);
    this._canvas.addEventListener("webglcontextrestored", this._onContextRestored as EventListener);
  }

  get gl(): WebGLRenderingContext | null {
    return this._gl;
  }

  get isAvailable(): boolean {
    return !!this._gl;
  }

  onDraw(fn: DrawHook): () => void {
    this._drawHooks.push(fn);
    return () => {
      const i = this._drawHooks.indexOf(fn);
      if (i >= 0) this._drawHooks.splice(i, 1);
    };
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    this._options.clearColor = [r, g, b, a];
    this.applyGlState();
  }

  setDepthTest(enabled: boolean) {
    this._options.depthTest = enabled;
    this.applyGlState();
  }

  /** Sets an optional scissor rectangle in pixels; null disables scissor. */
  setScissor(x: number, y: number, w: number, h: number): void {
    this._scissorRect = { x, y, w, h };
  }

  /** Clears the scissor rectangle. */
  clearScissor(): void {
    this._scissorRect = null;
  }

  start() {
    if (this._running) return;
    if (!this._gl) return; // no-op when WebGL is unavailable
    this._running = true;
    const loop = () => {
      if (!this._running) return;
      this.frame();
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (!this._running) return;
    this._running = false;
    if (this._rafId !== null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  /** Render a single frame immediately. */
  renderOnce(): void {
    this.frame();
  }

  private applyGlState() {
    const gl = this.gl;
    if (!gl) return;
    const { clearColor, depthTest } = this._options;
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    if (depthTest) gl.enable(gl.DEPTH_TEST);
    else gl.disable(gl.DEPTH_TEST);
    // Premultiplied alpha blending defaults
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  private frame() {
    const gl = this.gl;
    if (!gl) return;
    gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    if (this._scissorRect) {
      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(this._scissorRect.x, this._scissorRect.y, this._scissorRect.w, this._scissorRect.h);
    } else {
      gl.disable(gl.SCISSOR_TEST);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const fn of this._drawHooks) fn(gl, this._program!);
  }
}
