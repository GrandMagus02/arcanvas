import { Mesh } from "@arcanvas/core";

/**
 *
 */
export class TriangleMesh extends Mesh {
  private _vsSource: string | null = null;
  private _fsSource: string | null = null;

  constructor(vertices: Float32Array) {
    super(vertices);
  }

  override render(gl: WebGLRenderingContext): void {
    super.render(gl);

    // Always treat imported values as GLSL sources. If they don't look like GLSL, fall back to inline defaults.
    if (!this._vsSource || !this._fsSource) {
      this._vsSource = "attribute vec2 vertPosition;\n\nvoid main() {\n  gl_Position = vec4(vertPosition, 0.0, 1.0);\n}";
      this._fsSource = "precision mediump float;\n\nvoid main() {\n  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n}";
    }

    // Lazily build and link a program for this mesh, once.
    if (!this._program) {
      const vs = gl.createShader(gl.VERTEX_SHADER);
      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vs || !fs) return;

      gl.shaderSource(vs, this._vsSource);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        console.warn("Vertex shader compile error:", gl.getShaderInfoLog(vs) || "");
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return;
      }

      gl.shaderSource(fs, this._fsSource);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.warn("Fragment shader compile error:", gl.getShaderInfoLog(fs) || "");
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return;
      }

      const prog = gl.createProgram();
      if (!prog) {
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return;
      }
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);

      // Validate link status to avoid using an invalid program.
      const linked = gl.getProgramParameter(prog, gl.LINK_STATUS) as boolean;
      if (!linked) {
        const log = gl.getProgramInfoLog(prog) || "Unknown program link error";
        console.warn("Program link failed:", log);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        return;
      }

      // Cache and cleanup shaders after successful link
      this._program = prog;
      this._vertexShader = vs;
      this._fragmentShader = fs;
    }

    if (!this._program) return;

    gl.useProgram(this._program);

    // Buffer is bound in super.render; set up the attribute pointer each frame.
    const positionLocation = gl.getAttribLocation(this._program, "vertPosition");
    if (positionLocation === -1) {
      console.warn("Attribute vertPosition not found");
      return;
    }
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(positionLocation);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
