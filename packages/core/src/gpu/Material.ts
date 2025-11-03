/**
 *
 */
export interface UniformValue {
  kind: "1f" | "2f" | "3f" | "4f" | "1i" | "2i" | "3i" | "4i";
  value: number[];
}

/**
 *
 */
export class Material {
  constructor(
    public program: WebGLProgram,
    public uniforms: Record<string, UniformValue> = {}
  ) {}

  bind(gl: WebGLRenderingContext): void {
    gl.useProgram(this.program);
    for (const [name, u] of Object.entries(this.uniforms)) {
      const loc = gl.getUniformLocation(this.program, name);
      if (!loc) continue;
      switch (u.kind) {
        case "1f":
          gl.uniform1f(loc, u.value[0] ?? 0);
          break;
        case "2f":
          gl.uniform2f(loc, u.value[0] ?? 0, u.value[1] ?? 0);
          break;
        case "3f":
          gl.uniform3f(loc, u.value[0] ?? 0, u.value[1] ?? 0, u.value[2] ?? 0);
          break;
        case "4f":
          gl.uniform4f(loc, u.value[0] ?? 0, u.value[1] ?? 0, u.value[2] ?? 0, u.value[3] ?? 0);
          break;
        case "1i":
          gl.uniform1i(loc, (u.value[0] ?? 0) | 0);
          break;
        case "2i":
          gl.uniform2i(loc, (u.value[0] ?? 0) | 0, (u.value[1] ?? 0) | 0);
          break;
        case "3i":
          gl.uniform3i(loc, (u.value[0] ?? 0) | 0, (u.value[1] ?? 0) | 0, (u.value[2] ?? 0) | 0);
          break;
        case "4i":
          gl.uniform4i(loc, (u.value[0] ?? 0) | 0, (u.value[1] ?? 0) | 0, (u.value[2] ?? 0) | 0, (u.value[3] ?? 0) | 0);
          break;
      }
    }
  }
}
