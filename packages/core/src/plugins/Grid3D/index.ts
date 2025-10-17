import { Arcanvas, type ArcanvasPluginInstance } from "../../Arcanvas";
import { Viewport3D } from "../Viewport3D";

const GRID3D_VS_URL = new URL("./shaders/grid3d.vert", import.meta.url).toString();
const GRID3D_FS_URL = new URL("./shaders/grid3d.frag", import.meta.url).toString();

export interface Grid3DOptions {
  viewport3D?: Viewport3D;
  size?: number; // half-extent of plane
  spacing?: number; // world units
  color?: string;
  axes?: boolean;
}

/**
 * Renders an infinite-looking XZ grid using perspective projection.
 */
export class Grid3D implements ArcanvasPluginInstance {
  destroy(): void {
    // TODO: Implement
  }

  private readonly arcanvas: Arcanvas;
  private readonly viewport3D: Viewport3D;

  private size = 1000;
  private spacing = 1;
  private color = "#404040";
  private axes = true;

  // GL state
  private program: WebGLProgram | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private aPositionLoc = -1;
  private uViewProjLoc: WebGLUniformLocation | null = null;
  private uColorLoc: WebGLUniformLocation | null = null;
  private uSpacingLoc: WebGLUniformLocation | null = null;
  private uAxesLoc: WebGLUniformLocation | null = null;

  private vsSource?: string;
  private fsSource?: string;
  private shaderLoadPromise: Promise<void> | null = null;

  constructor(arcanvas: Arcanvas, options: Grid3DOptions = {}) {
    this.arcanvas = arcanvas;
    const injected = options.viewport3D ?? arcanvas.inject<Viewport3D>(Viewport3D);
    this.viewport3D = injected ?? new Viewport3D(arcanvas);
    if (typeof options.size === "number") this.size = options.size;
    if (typeof options.spacing === "number") this.spacing = options.spacing;
    if (typeof options.color === "string") this.color = options.color;
    if (typeof options.axes === "boolean") this.axes = options.axes;
    this.arcanvas.provide(Grid3D, this);
  }

  draw(gl: WebGLRenderingContext) {
    this.ensureProgram(gl);
    if (!this.program || !this.positionBuffer || this.aPositionLoc < 0 || !this.uViewProjLoc || !this.uColorLoc || !this.uSpacingLoc || !this.uAxesLoc) return;

    const canvas = this.arcanvas.canvas;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    // Build a large XZ quad centered at origin
    const s = this.size;
    const positions = new Float32Array([
      -s, 0, -s,
      s, 0, -s,
      -s, 0, s,
      -s, 0, s,
      s, 0, -s,
      s, 0, s,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.vertexAttribPointer(this.aPositionLoc, 3, gl.FLOAT, false, 0, 0);

    const vp = this.viewport3D.getViewProjMatrix();
    gl.uniformMatrix4fv(this.uViewProjLoc, false, vp);

    const col = this.parseColor(this.color);
    gl.uniform4f(this.uColorLoc, col[0], col[1], col[2], col[3]);
    gl.uniform1f(this.uSpacingLoc, this.spacing);
    gl.uniform1i(this.uAxesLoc, this.axes ? 1 : 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private ensureProgram(gl: WebGLRenderingContext) {
    if (this.program && this.positionBuffer && this.uViewProjLoc && this.uColorLoc && this.uSpacingLoc && this.uAxesLoc && this.aPositionLoc >= 0) return;
    if (!this.vsSource || !this.fsSource) {
      if (!this.shaderLoadPromise) this.shaderLoadPromise = this.loadShaders();
      return;
    }
    const vs = this.compileShader(gl, gl.VERTEX_SHADER, this.vsSource!);
    const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, this.fsSource!);
    const program = gl.createProgram();
    if (!program || !vs || !fs) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      try { console.error("Grid3D: link error", gl.getProgramInfoLog(program)); } catch {}
      gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteProgram(program); return;
    }
    this.program = program;
    this.aPositionLoc = gl.getAttribLocation(program, "a_position");
    this.uViewProjLoc = gl.getUniformLocation(program, "u_viewProj");
    this.uColorLoc = gl.getUniformLocation(program, "u_color");
    this.uSpacingLoc = gl.getUniformLocation(program, "u_spacing");
    this.uAxesLoc = gl.getUniformLocation(program, "u_axes");
    this.positionBuffer = gl.createBuffer();
  }

  private async loadShaders() {
    const fallbackVS = `
attribute vec3 a_position;
uniform mat4 u_viewProj;
void main(){
  gl_Position = u_viewProj * vec4(a_position, 1.0);
}`;
    const fallbackFS = `
precision mediump float;
uniform vec4 u_color;
uniform float u_spacing;
uniform int u_axes;

// Compute anti-aliased grid lines in XZ using screen-space derivatives
float gridFactor(vec2 coord){
  vec2 g = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  return line;
}

void main(){
  // World position reconstruction is not available in this simple shader, so
  // approximate by using clip-space varyings: instead we rely on vertex world XZ
  // baked in via a_position and uniform spacing in world units.
  // We map world XZ to a coarse grid coloring.
  // Note: for better quality, a more advanced approach would require passing
  // world pos to fragment shader and using fwidth on that in screen space.
  vec3 world = vec3(0.0); // not available, kept for clarity
  vec4 col = u_color;
  // Simple checker lines based on a_position is not available here; fallback to solid color
  gl_FragColor = col;
}`;
    try {
      const [vsRes, fsRes] = await Promise.all([fetch(GRID3D_VS_URL), fetch(GRID3D_FS_URL)]);
      if (!vsRes.ok || !fsRes.ok) throw new Error("HTTP error");
      this.vsSource = await vsRes.text();
      this.fsSource = await fsRes.text();
    } catch (err) {
      try { console.warn("Grid3D: using fallback shaders", err); } catch {}
      this.vsSource = fallbackVS;
      this.fsSource = fallbackFS;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      try { console.error("Grid3D: shader error", gl.getShaderInfoLog(shader)); } catch {}
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private parseColor(hex: string): [number, number, number, number] {
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
    return [0.25, 0.25, 0.25, 1.0];
  }
}

export const grid3DPlugin = (arcanvas: Arcanvas) => new Grid3D(arcanvas);
