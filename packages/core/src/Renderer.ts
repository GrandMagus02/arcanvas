/**
 * A function that can be used to draw a scene.
 */
export type DrawHook = (gl: WebGLRenderingContext) => void;

/**
 * Options for configuring a renderer.
 */
export interface RendererOptions {
  clearColor?: [number, number, number, number];
  depthTest?: boolean;
}

/**
 * A class that can be used to render a scene.
 */
export class Renderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly gl: WebGLRenderingContext | null;
  private readonly drawHooks: DrawHook[] = [];
  private rafId: number | null = null;
  private running = false;
  private clearColor: [number, number, number, number] = [0, 0, 0, 1];
  private depthTest = true;

  constructor(canvas: HTMLCanvasElement, options: RendererOptions = {}) {
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    this.canvas = canvas;
    this.gl = gl;
    if (options.clearColor) this.clearColor = options.clearColor;
    if (typeof options.depthTest === "boolean") this.depthTest = options.depthTest;
    this.applyGlState();
  }

  get context(): WebGLRenderingContext | null {
    return this.gl;
  }

  get isAvailable(): boolean {
    return !!this.gl;
  }

  onDraw(fn: DrawHook): () => void {
    this.drawHooks.push(fn);
    return () => {
      const i = this.drawHooks.indexOf(fn);
      if (i >= 0) this.drawHooks.splice(i, 1);
    };
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    this.clearColor = [r, g, b, a];
    this.applyGlState();
  }

  setDepthTest(enabled: boolean) {
    this.depthTest = enabled;
    this.applyGlState();
  }

  start() {
    if (this.running) return;
    if (!this.gl) return; // no-op when WebGL is unavailable
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.frame();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  }

  private applyGlState() {
    const gl = this.gl;
    if (!gl) return;
    gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
    if (this.depthTest) gl.enable(gl.DEPTH_TEST);
    else gl.disable(gl.DEPTH_TEST);
  }

  private frame() {
    const gl = this.gl;
    if (!gl) return;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (const fn of this.drawHooks) fn(gl);
  }
}
