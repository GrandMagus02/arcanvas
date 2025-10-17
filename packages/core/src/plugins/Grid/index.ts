import { Arcanvas, type ArcanvasPluginInstance } from "../../Arcanvas";
import { Viewport } from "../Viewport";
const GRID_VS_URL = new URL("./shaders/grid.vert", import.meta.url).toString();
const GRID_FS_URL = new URL("./shaders/grid.frag", import.meta.url).toString();

/**
 * Options for the Grid plugin.
 * @param viewport - The viewport to use for the grid.
 * @param spacing - The spacing between grid lines in world units.
 * @param lineColor - The color of the grid lines.
 * @param lineWidth - The width of the grid lines.
 * @param showAxes - Whether to show the axes.
 * @param axesColor - The color of the axes.
 */
export interface GridOptions {
  viewport?: Viewport;
  spacing?: number; // world units between grid lines
  lineColor?: string;
  lineWidth?: number;
  showAxes?: boolean;
  axesColor?: string;
}

/**
 * Renders a simple infinite grid in world-space using the provided Viewport.
 * Call `draw(gl)` within your render loop after clearing the canvas.
 */
export class Grid implements ArcanvasPluginInstance {
  destroy(): void {
    // TODO: Implement
  }

  private readonly arcanvas: Arcanvas;
  private readonly viewport: Viewport;
  private spacing: number = 50;
  private lineColor = "#e0e0e0";
  private lineWidth = 1;
  private showAxes = true;
  private axesColor = "#a0a0a0";

  // WebGL state (created lazily on first draw)
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private aPositionLoc: number = -1;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uScaleLoc: WebGLUniformLocation | null = null;
  private uTranslationLoc: WebGLUniformLocation | null = null;
  private uColorLoc: WebGLUniformLocation | null = null;
  private vsSource?: string;
  private fsSource?: string;
  private shaderLoadPromise: Promise<void> | null = null;

  constructor(arcanvas: Arcanvas, options: GridOptions = {}) {
    this.arcanvas = arcanvas;
    const injected = options.viewport ?? arcanvas.inject<Viewport>(Viewport);
    this.viewport = injected ?? new Viewport(arcanvas);
    if (typeof options.spacing === "number") this.spacing = options.spacing;
    if (typeof options.lineColor === "string") this.lineColor = options.lineColor;
    if (typeof options.lineWidth === "number") this.lineWidth = options.lineWidth;
    if (typeof options.showAxes === "boolean") this.showAxes = options.showAxes;
    if (typeof options.axesColor === "string") this.axesColor = options.axesColor;
    // Provide this Grid instance for consumers
    this.arcanvas.provide(Grid, this);
  }

  getViewport(): Viewport {
    return this.viewport;
  }

  draw(gl: WebGLRenderingContext) {
    this.ensureProgram(gl);

    const canvas = this.arcanvas.canvas;
    gl.viewport(0, 0, canvas.width, canvas.height);

    if (
      !this.program ||
      !this.positionBuffer ||
      this.aPositionLoc < 0 ||
      !this.uResolutionLoc ||
      !this.uScaleLoc ||
      !this.uTranslationLoc ||
      !this.uColorLoc
    ) {
      return;
    }

    const bounds = this.viewport.getVisibleWorldBounds();
    const minX = Math.floor(bounds.minX / this.spacing) * this.spacing;
    const maxX = Math.ceil(bounds.maxX / this.spacing) * this.spacing;
    const minY = Math.floor(bounds.minY / this.spacing) * this.spacing;
    const maxY = Math.ceil(bounds.maxY / this.spacing) * this.spacing;

    // Build vertex list for grid lines (world space)
    const verts: number[] = [];
    for (let x = minX; x <= maxX; x += this.spacing) {
      verts.push(x, minY, x, maxY);
    }
    for (let y = minY; y <= maxY; y += this.spacing) {
      verts.push(minX, y, maxX, y);
    }
    const vertData = new Float32Array(verts);

    // Upload geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.DYNAMIC_DRAW);
    gl.useProgram(this.program);
    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Common uniforms
    const scale = this.viewport.scale;
    const translation = this.viewport.translation;
    gl.uniform2f(this.uResolutionLoc, canvas.width, canvas.height);
    gl.uniform1f(this.uScaleLoc, scale);
    gl.uniform2f(this.uTranslationLoc, translation.x, translation.y);

    // Grid lines color
    const gridColor = this.parseColor(this.lineColor);
    gl.uniform4f(this.uColorLoc, gridColor[0], gridColor[1], gridColor[2], gridColor[3]);
    try {
      // Some platforms ignore lineWidth; safe to attempt
      gl.lineWidth(Math.max(1, this.lineWidth));
    } catch {
      // ignore
    }
    gl.drawArrays(gl.LINES, 0, vertData.length / 2);

    // Axes pass (separate color)
    if (this.showAxes) {
      const axesVerts = new Float32Array([minX, 0, maxX, 0, 0, minY, 0, maxY]);
      gl.bufferData(gl.ARRAY_BUFFER, axesVerts, gl.DYNAMIC_DRAW);
      const axesColor = this.parseColor(this.axesColor);
      gl.uniform4f(this.uColorLoc, axesColor[0], axesColor[1], axesColor[2], axesColor[3]);
      gl.drawArrays(gl.LINES, 0, axesVerts.length / 2);
    }
  }

  private ensureProgram(gl: WebGLRenderingContext) {
    if (
      this.program &&
      this.positionBuffer &&
      this.uResolutionLoc &&
      this.uScaleLoc &&
      this.uTranslationLoc &&
      this.uColorLoc &&
      this.aPositionLoc >= 0
    ) {
      return;
    }
    if (!this.vsSource || !this.fsSource) {
      if (!this.shaderLoadPromise) {
        this.shaderLoadPromise = this.loadShaders();
      }
      return;
    }
    const vs = this.compileShader(gl, gl.VERTEX_SHADER, this.vsSource);
    const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, this.fsSource);
    const program = gl.createProgram();
    if (!program || !vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      try {
        console.error("Grid: program link error:", gl.getProgramInfoLog(program));
      } catch {
        // ignore
      }
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
      return;
    }
    this.program = program;
    this.aPositionLoc = gl.getAttribLocation(program, "a_position");
    this.uResolutionLoc = gl.getUniformLocation(program, "u_resolution");
    this.uScaleLoc = gl.getUniformLocation(program, "u_scale");
    this.uTranslationLoc = gl.getUniformLocation(program, "u_translation");
    this.uColorLoc = gl.getUniformLocation(program, "u_color");
    this.positionBuffer = gl.createBuffer();
  }

  private async loadShaders() {
    const fallbackVS =
      "attribute vec2 a_position;\n" +
      "uniform vec2 u_resolution;\n" +
      "uniform float u_scale;\n" +
      "uniform vec2 u_translation;\n" +
      "void main(){\n" +
      "  vec2 screen = a_position * u_scale + u_translation;\n" +
      "  vec2 zeroToOne = screen / u_resolution;\n" +
      "  vec2 zeroToTwo = zeroToOne * 2.0;\n" +
      "  vec2 clip = zeroToTwo - 1.0;\n" +
      "  gl_Position = vec4(clip * vec2(1.0, -1.0), 0.0, 1.0);\n" +
      "}";
    const fallbackFS =
      "precision mediump float;\n" +
      "uniform vec4 u_color;\n" +
      "void main(){ gl_FragColor = u_color; }";
    try {
      const [vsRes, fsRes] = await Promise.all([fetch(GRID_VS_URL), fetch(GRID_FS_URL)]);
      if (!vsRes.ok || !fsRes.ok) throw new Error("HTTP error");
      this.vsSource = await vsRes.text();
      this.fsSource = await fsRes.text();
    } catch (err) {
      try {
        console.warn("Grid: using fallback inline shaders due to load error", err);
      } catch {
        // ignore
      }
      this.vsSource = fallbackVS;
      this.fsSource = fallbackFS;
    }
  }

  private compileShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string
  ): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      try {
        console.error("Grid: shader compile error:", gl.getShaderInfoLog(shader));
      } catch {
        // ignore
      }
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private parseColor(hex: string): [number, number, number, number] {
    // Supports #rgb, #rgba, #rrggbb, #rrggbbaa
    let h = hex.trim();
    if (h.charAt(0) === "#") h = h.slice(1);
    if (h.length === 3 || h.length === 4) {
      const r = parseInt(h.charAt(0) + h.charAt(0), 16);
      const g = parseInt(h.charAt(1) + h.charAt(1), 16);
      const b = parseInt(h.charAt(2) + h.charAt(2), 16);
      const a = h.length === 4 ? parseInt(h.charAt(3) + h.charAt(3), 16) : 255;
      return [r / 255, g / 255, b / 255, a / 255];
    }
    if (h.length === 6 || h.length === 8) {
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
      return [r / 255, g / 255, b / 255, a / 255];
    }
    // Fallback to light gray
    return [0.88, 0.88, 0.88, 1.0];
  }
}

export const gridPlugin = (arcanvas: Arcanvas) => new Grid(arcanvas);
