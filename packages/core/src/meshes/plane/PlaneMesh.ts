import { Mesh } from "../../objects/Mesh";
import { TransformationMatrix } from "../../utils/TransformationMatrix";
import FS_SOURCE from "./plane.frag";
import VS_SOURCE from "./plane.vert";

/**
 *
 */
export class PlaneMesh extends Mesh {
  private _aPos: number = -1;
  private _uProjection: WebGLUniformLocation | null = null;
  private _shaderInitPromise: Promise<void> | null = null;
  private _viewProjectionMatrix: TransformationMatrix | null = null;

  private static isInlineSource(src: string): boolean {
    return /void\s+main\s*\(/.test(src) || /gl_FragColor|gl_Position/.test(src);
  }

  private static resolveAssetUrl(relativePath: string): string {
    if (/^https?:\/\//.test(relativePath) || relativePath.startsWith("/")) return relativePath;
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src$="/dist/main.js"]');
    const base = script?.src ? new URL(".", script.src).toString() : new URL("/dist/", location.href).toString();
    return new URL(relativePath.replace(/^\.\//, ""), base).toString();
  }

  private async initProgram(ctx: WebGLRenderingContext): Promise<void> {
    if (this._program) return;
    let vsSource = VS_SOURCE;
    let fsSource = FS_SOURCE;

    // If bundler emitted URLs for shaders, fetch their contents
    if (!PlaneMesh.isInlineSource(vsSource)) {
      const url = PlaneMesh.resolveAssetUrl(vsSource);
      vsSource = await fetch(url).then((r) => r.text());
    }
    if (!PlaneMesh.isInlineSource(fsSource)) {
      const url = PlaneMesh.resolveAssetUrl(fsSource);
      fsSource = await fetch(url).then((r) => r.text());
    }

    const vs = ctx.createShader(ctx.VERTEX_SHADER)!;
    ctx.shaderSource(vs, vsSource);
    ctx.compileShader(vs);
    if (!ctx.getShaderParameter(vs, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(vs) || "";
      console.error("Vertex shader compile error:", info);
      ctx.deleteShader(vs);
      return;
    }
    const fs = ctx.createShader(ctx.FRAGMENT_SHADER)!;
    ctx.shaderSource(fs, fsSource);
    ctx.compileShader(fs);
    if (!ctx.getShaderParameter(fs, ctx.COMPILE_STATUS)) {
      const info = ctx.getShaderInfoLog(fs) || "";
      console.error("Fragment shader compile error:", info);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      return;
    }
    const prog = ctx.createProgram();
    if (!prog) return;
    ctx.attachShader(prog, vs);
    ctx.attachShader(prog, fs);
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
      const info = ctx.getProgramInfoLog(prog) || "";
      console.error("Program link error:", info);
      ctx.deleteShader(vs);
      ctx.deleteShader(fs);
      ctx.deleteProgram(prog);
      return;
    }
    this._program = prog;
    this._aPos = ctx.getAttribLocation(prog, "a_position");
    this._uProjection = ctx.getUniformLocation(prog, "u_projection");
    // shaders can be detached/deleted after linking to free resources
    ctx.detachShader(prog, vs);
    ctx.detachShader(prog, fs);
    ctx.deleteShader(vs);
    ctx.deleteShader(fs);
  }

  /**
   * Set the view-projection matrix (combines view and projection).
   * If null, uses identity matrix (no transformation).
   */
  setViewProjection(matrix: TransformationMatrix | null): void {
    this._viewProjectionMatrix = matrix;
  }

  /**
   * Set the projection matrix (deprecated: use setViewProjection instead).
   * @deprecated Use setViewProjection instead
   */
  setProjectionMatrix(matrix: TransformationMatrix | null): void {
    this.setViewProjection(matrix);
  }

  override render(gl: WebGLRenderingContext): void {
    // Ensure vertex buffer exists and is uploaded
    if (!this["_vertexBuffer"]) {
      this["_vertexBuffer"] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this["_vertexBuffer"]);
      gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    }

    // Lazy initialize program; if fetch required, schedule and return until ready
    if (!this._program) {
      if (!this._shaderInitPromise) {
        this._shaderInitPromise = this.initProgram(gl);
      }
      // Not ready yet; try again next frame
      return;
    }

    if (this._aPos < 0) return;

    gl.useProgram(this._program);

    // Set view-projection matrix uniform if available
    // WebGL expects column-major matrices with transpose=false
    if (this._uProjection) {
      if (this._viewProjectionMatrix) {
        // Convert row-major to column-major for WebGL
        const cm = this._viewProjectionMatrix.toColumnMajorArray();
        gl.uniformMatrix4fv(this._uProjection, false, cm);
      } else {
        // Use identity matrix if no view-projection matrix is set
        const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        gl.uniformMatrix4fv(this._uProjection, false, identity);
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this["_vertexBuffer"]);
    gl.enableVertexAttribArray(this._aPos);
    gl.vertexAttribPointer(this._aPos, 3, gl.FLOAT, false, 0, 0);
    const vertCount = this.vertices.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, vertCount);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
}
