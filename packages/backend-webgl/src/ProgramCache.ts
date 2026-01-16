/**
 * Cache for compiled WebGL programs.
 */
export class ProgramCache {
  private cache = new Map<string, WebGLProgram>();

  /**
   * Gets an existing program or creates a new one.
   */
  getOrCreate(gl: WebGLRenderingContext, key: string, vsSource: string, fsSource: string): WebGLProgram | null {
    const hit = this.cache.get(key);
    if (hit) return hit;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error("Vertex shader compile error:", gl.getShaderInfoLog(vs));
      gl.deleteShader(vs);
      return null;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error("Fragment shader compile error:", gl.getShaderInfoLog(fs));
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return null;
    }

    const prog = gl.createProgram();
    if (!prog) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return null;
    }

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(prog));
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
      return null;
    }

    // Cleanup after link
    gl.detachShader(prog, vs);
    gl.detachShader(prog, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    this.cache.set(key, prog);
    return prog;
  }

  /**
   * Disposes all cached programs.
   */
  dispose(gl: WebGLRenderingContext): void {
    for (const prog of this.cache.values()) {
      gl.deleteProgram(prog);
    }
    this.cache.clear();
  }
}
