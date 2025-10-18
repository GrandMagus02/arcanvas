import { type Plugin } from "../../Arcanvas";
import type { ViewportAPI } from "../viewport";
import GRID3D_FS_URL from "./shaders/grid3d.frag";
import GRID3D_VS_URL from "./shaders/grid3d.vert";

/**
 * Options for the Grid plugin.
 */
export interface GridOptions {
  size?: number; // half-extent of plane
  spacing?: number; // world units
  color?: string;
  axes?: boolean;
}

/**
 * Renders an infinite-looking XZ grid using perspective projection.
 */
export type GridAPI = {
  draw(gl: WebGLRenderingContext): void;
  setSize(size: number): void;
  setSpacing(spacing: number): void;
  setColor(hex: string): void;
  setAxes(show: boolean): void;
};

export const Grid: Plugin<"grid", GridAPI, GridOptions> = {
  name: "grid",
  deps: ["viewport"],
  setup(ctx, options = {}) {
    let size = options.size ?? 1000;
    let spacing = options.spacing ?? 1;
    let color = options.color ?? "#404040";
    let axes = options.axes ?? true;

    // GL state
    let program: WebGLProgram | null = null;
    let positionBuffer: WebGLBuffer | null = null;
    let aPositionLoc = -1;
    let uViewProjLoc: WebGLUniformLocation | null = null;
    let uColorLoc: WebGLUniformLocation | null = null;
    let uSpacingLoc: WebGLUniformLocation | null = null;
    let uAxesLoc: WebGLUniformLocation | null = null;

    let vsSource: string | undefined;
    let fsSource: string | undefined;

    const ensureProgram = (gl: WebGLRenderingContext) => {
      if (
        program &&
        positionBuffer &&
        uViewProjLoc &&
        uColorLoc &&
        uSpacingLoc &&
        uAxesLoc &&
        aPositionLoc >= 0
      )
        return;
      if (!vsSource || !fsSource) {
        loadShaders();
        return;
      }
      const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
      const prog = gl.createProgram();
      if (!prog || !vs || !fs) return;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        try {
          console.error("Grid3D: link error", gl.getProgramInfoLog(prog));
        } catch {
          // ignore
        }
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteProgram(prog);
        return;
      }
      program = prog;
      aPositionLoc = gl.getAttribLocation(prog, "a_position");
      uViewProjLoc = gl.getUniformLocation(prog, "u_viewProj");
      uColorLoc = gl.getUniformLocation(prog, "u_color");
      uSpacingLoc = gl.getUniformLocation(prog, "u_spacing");
      uAxesLoc = gl.getUniformLocation(prog, "u_axes");
      positionBuffer = gl.createBuffer();
    };

    const loadShaders = () => {
      vsSource = GRID3D_VS_URL;
      fsSource = GRID3D_FS_URL;
    };

    const compileShader = (
      gl: WebGLRenderingContext,
      type: number,
      source: string
    ): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, sanitizeShaderSource(source));
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        try {
          console.error("Grid3D: shader error", gl.getShaderInfoLog(shader));
        } catch {
          // ignore
        }
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const sanitizeShaderSource = (source: string): string => {
      let out = source.replace(/^\uFEFF/, "");
      out = out.replace(/^[^\S\r\n]*/g, "");
      return out;
    };

    const parseColor = (hex: string): [number, number, number, number] => {
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
    };

    const draw = (gl: WebGLRenderingContext) => {
      ensureProgram(gl);
      if (
        !program ||
        !positionBuffer ||
        aPositionLoc < 0 ||
        !uViewProjLoc ||
        !uColorLoc ||
        !uSpacingLoc ||
        !uAxesLoc
      )
        return;
      const canvas = ctx.canvas;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const s = size;
      const positions = new Float32Array([
        -s,
        0,
        -s,
        s,
        0,
        -s,
        -s,
        0,
        s,
        -s,
        0,
        s,
        s,
        0,
        -s,
        s,
        0,
        s,
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aPositionLoc);
      gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);
      const vp = ctx.get<ViewportAPI>("viewport")?.getViewProjMatrix();
      if (!vp) return;
      gl.uniformMatrix4fv(uViewProjLoc, false, new Float32Array(vp.toArray()));
      const col = parseColor(color);
      gl.uniform4f(uColorLoc, col[0], col[1], col[2], col[3]);
      gl.uniform1f(uSpacingLoc, spacing);
      gl.uniform1i(uAxesLoc, axes ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    return {
      draw,
      setSize: (n: number) => {
        size = n;
      },
      setSpacing: (n: number) => {
        spacing = n;
      },
      setColor: (hex: string) => {
        color = hex;
      },
      setAxes: (show: boolean) => {
        axes = show;
      },
    };
  },
};
